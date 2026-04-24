import { prisma } from "@/lib/prisma";
import { LibraryStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export interface GetLibraryParams {
  userId: string;
  status?: LibraryStatus;
  page?: number;
  limit?: number;
}

export const LibraryService = {
  /**
   * Toggle bookmark status (READING or null)
   */
  async toggleBookmark(userId: string, storyId: number) {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });

    return this.changeLibraryStatus(
      userId,
      storyId,
      existing ? null : LibraryStatus.READING
    );
  },

  /**
   * Thay đổi trạng thái thư viện nâng cao
   */
  async changeLibraryStatus(
    userId: string,
    storyId: number,
    status: LibraryStatus | null,
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
  },

  /**
   * Lấy danh sách truyện lưu trong thư viện (có phân trang)
   */
  async getLibraryEntries(params: GetLibraryParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { 
          userId: params.userId,
          ...(params.status ? { status: params.status } : {})
        },
        include: {
          Story: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              status: true,
              views: true,
              author: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bookmark.count({
        where: { 
          userId: params.userId,
          ...(params.status ? { status: params.status } : {})
        }
      })
    ]);

    return {
      stories: entries.map((entry) => ({
        ...entry.Story,
        libraryStatus: entry.status,
        bookmarkedAt: entry.updatedAt,
      })),
      total
    };
  },

  /**
   * Cập nhật lịch sử đọc
   */
  async updateReadingHistory(
    userId: string,
    storyId: number,
    chapterId: number,
    scrollPercentage: number = 0,
  ) {
    const history = await prisma.readingHistory.upsert({
      where: {
        userId_storyId: { userId, storyId },
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
        updatedAt: new Date(),
      },
    });

    revalidatePath("/tu-truyen");
    return history;
  }
};
