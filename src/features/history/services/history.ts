"use server";

import { prisma } from "@/lib/prisma";
import { Story, Chapter } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export type HistoryItemData = {
  id: number;
  userId: string;
  storyId: number;
  chapterId: number;
  scrollPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
  Chapter: Pick<Chapter, "id" | "chapterNum" | "title">;
  Story: Pick<Story, "id" | "title" | "slug" | "coverUrl">;
};

/**
 * Upsert reading history for a user
 * If a record for this userId and storyId exists, update the chapterId and updatedAt
 * If it doesn't exist, create a new record
 */
export async function upsertReadingHistory(
  userId: string,
  storyId: number,
  chapterId: number,
  scrollPercentage: number = 0,
) {
  try {
    const history = await prisma.readingHistory.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {
        chapterId,
        scrollPercentage,
        updatedAt: new Date(),
      },
      create: {
        userId,
        storyId,
        chapterId,
        scrollPercentage,
      },
    });

    revalidatePath("/tu-truyen");

    return { success: true, history };
  } catch (error) {
    console.error("Error upserting reading history:", error);
    return { success: false, error: "Failed to update reading history" };
  }
}

/**
 * Get paginated reading history for a user
 */
export async function getUserReadingHistory(
  userId: string,
  page: number = 1,
  limit: number = 20,
) {
  try {
    const skip = (page - 1) * limit;

    const [histories, total] = await Promise.all([
      prisma.readingHistory.findMany({
        where: { userId },
        include: {
          Story: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
            },
          },
          Chapter: {
            select: {
              id: true,
              chapterNum: true,
              title: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.readingHistory.count({ where: { userId } }),
    ]);

    return {
      success: true,
      histories: histories as HistoryItemData[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return {
      success: false,
      error: "Failed to fetch reading history",
      histories: [],
    };
  }
}

/**
 * Sync multiple history items from LocalStorage to Database
 * Useful for when a user logs in and needs their guest history merged
 */
export async function syncLocalHistoryToServer(
  userId: string,
  localHistories: {
    storyId: number;
    chapterId: number;
    updatedAt: number;
    scrollPercentage?: number;
  }[],
) {
  try {
    // Tối ưu bằng transaction với nhiều upsert
    // Vì prisma.transaction không hỗ trợ upsertMany (chưa có ở postgres), ta loop và gọi upsert trong transaction

    // Nếu quá nhiều data (guest đọc nghìn cuốn), thì có thể cần chunking, nhưng thường < 100
    const queries = localHistories.map((hx) =>
      prisma.readingHistory.upsert({
        where: {
          userId_storyId: {
            userId,
            storyId: hx.storyId,
          },
        },
        update: {
          // Chỉ cập nhật nếu local history mới hơn server (giả thiết: timestamps)
          // Nếu muốn đơn giản thì cứ đè
          chapterId: hx.chapterId,
          scrollPercentage: hx.scrollPercentage || 0,
          updatedAt: new Date(hx.updatedAt),
        },
        create: {
          userId,
          storyId: hx.storyId,
          chapterId: hx.chapterId,
          scrollPercentage: hx.scrollPercentage || 0,
          updatedAt: new Date(hx.updatedAt),
        },
      }),
    );

    await prisma.$transaction(queries);
    revalidatePath("/tu-truyen");
    return { success: true };
  } catch (error) {
    console.error("Error syncing local history to server:", error);
    return { success: false, error: "Failed to sync history" };
  }
}

/**
 * Remove a specific reading history item
 */
export async function removeReadingHistory(userId: string, storyId: number) {
  try {
    await prisma.readingHistory.delete({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });
    revalidatePath("/tu-truyen");
    return { success: true };
  } catch (error) {
    console.error("Error removing reading history:", error);
    return { success: false, error: "Failed to remove reading history" };
  }
}

/**
 * Clear ALL reading history for a user
 */
export async function clearAllReadingHistory(userId: string) {
  try {
    const deleted = await prisma.readingHistory.deleteMany({
      where: { userId },
    });
    revalidatePath("/tu-truyen");
    return { success: true, count: deleted.count };
  } catch (error) {
    console.error("Error clearing all reading history:", error);
    return { success: false, error: "Failed to clear all reading history" };
  }
}
