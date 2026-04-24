"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { LibraryStatus } from "@/generated/prisma/client";

/**
 * Thêm hoặc xoá truyện khỏi tủ truyện ( Bookmark )
 * Dùng cho logic cũ (Toggle Nút mặc định)
 */
export async function toggleBookmark(userId: string, storyId: number) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_storyId: { userId, storyId } },
  });

  return changeLibraryStatus(
    userId,
    storyId,
    existing ? null : "READING"
  );
}

/**
 * Thay đổi trạng thái nâng cao của thư viện
 */
export async function changeLibraryStatus(
  userId: string,
  storyId: number,
  status: LibraryStatus | null, // null = xoá khỏi tủ truyện
) {
  if (status === null) {
    await prisma.bookmark.deleteMany({
      where: { userId, storyId },
    });
    revalidatePath("/tu-truyen");
    return { bookmarked: false, status: null };
  }

  const upserted = await prisma.bookmark.upsert({
    where: { userId_storyId: { userId, storyId } },
    update: { status, updatedAt: new Date() },
    create: { userId, storyId, status },
  });
  revalidatePath("/tu-truyen");
  return { bookmarked: true, status: upserted.status };
}

/**
 * Trả về status thư viện hiện tại của user cho story này
 */
export async function getLibraryStatus(userId: string, storyId: number): Promise<LibraryStatus | null> {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_storyId: { userId, storyId } },
    select: { status: true },
  });
  return existing ? existing.status : null;
}

/**
 * (Giữ lại tương thích cũ) Kiểm tra xem user đã lưu truyện này chưa
 */
export async function checkIsBookmarked(userId: string, storyId: number) {
  const status = await getLibraryStatus(userId, storyId);
  return status !== null;
}

/**
 * Lấy danh sách truyện đã lưu cua một user (Trạng thái Đang đọc)
 */
export async function getBookmarks(
  userId: string,
  limit: number = 20,
  skip: number = 0,
) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, status: "READING" },
    include: {
      Story: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          status: true,
          views: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: skip,
  });

  return bookmarks.map((b) => ({
    ...b.Story,
    bookmarkedAt: b.updatedAt,
  }));
}

/**
 * Cập nhật lịch sử đọc của người dùng khi vào trang đọc chương truyện
 */
export async function updateReadingHistory(
  userId: string,
  storyId: number,
  chapterId: number,
  scrollPercentage: number = 0,
) {
  const history = await prisma.readingHistory.upsert({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
    update: {
      chapterId: chapterId,
      scrollPercentage: scrollPercentage,
      updatedAt: new Date(),
    },
    create: {
      userId,
      storyId,
      chapterId,
      scrollPercentage: scrollPercentage,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/tu-truyen");
  return history;
}

/**
 * Lấy danh sách lịch sử đọc của một user
 */
export async function getReadingHistory(
  userId: string,
  limit: number = 20,
  skip: number = 0,
) {
  const history = await prisma.readingHistory.findMany({
    where: { userId },
    include: {
      Story: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          status: true,
        },
      },
      Chapter: {
        select: {
          id: true,
          title: true,
          chapterNum: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: skip,
  });

  return history;
}

/**
 * Lấy danh sách truyện Chờ đọc (Bookmark với status = WAITLIST)
 */
export async function getWaitlist(
  userId: string,
  limit: number = 20,
  skip: number = 0,
) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, status: "WAITLIST" },
    include: {
      Story: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          status: true,
          views: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: skip,
  });

  return bookmarks.map((b) => ({
    ...b.Story,
    bookmarkedAt: b.updatedAt,
  }));
}

/**
 * Lấy danh sách truyện Đã hoàn thành (Bookmark với status = COMPLETED)
 */
export async function getCompletedStories(
  userId: string,
  limit: number = 20,
  skip: number = 0,
) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, status: "COMPLETED" },
    include: {
      Story: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          status: true,
          views: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: skip,
  });

  return bookmarks.map((b) => ({
    ...b.Story,
    bookmarkedAt: b.updatedAt,
  }));
}
