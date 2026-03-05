import { prisma } from "@/lib/prisma";

/**
 * Thêm hoặc xoá truyện khỏi tủ truyện ( Bookmark )
 */
export async function toggleBookmark(userId: string, storyId: number) {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });

  if (existing) {
    // Đã có -> xoá
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    return { bookmarked: false };
  } else {
    // Chưa có -> thêm
    await prisma.bookmark.create({
      data: {
        userId,
        storyId,
      },
    });
    return { bookmarked: true };
  }
}

/**
 * Kiểm tra xem user đã lưu truyện này chưa
 */
export async function checkIsBookmarked(userId: string, storyId: number) {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });
  return !!existing;
}

/**
 * Lấy danh sách truyện đã lưu của một user
 */
export async function getBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
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
    orderBy: { createdAt: "desc" },
  });

  return bookmarks.map((b) => ({
    ...b.Story,
    bookmarkedAt: b.createdAt,
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
  return await prisma.readingHistory.upsert({
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
}

/**
 * Lấy danh sách lịch sử đọc của một user
 */
export async function getReadingHistory(userId: string) {
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
  });

  return history;
}

/**
 * Lấy danh sách truyện Chờ đọc (Đã Bookmark nhưng chưa có trong Lịch sử đọc)
 */
export async function getWaitlist(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      Story: {
        ReadingHistory: {
          none: {
            userId: userId,
          },
        },
      },
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
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookmarks.map((b) => ({
    ...b.Story,
    bookmarkedAt: b.createdAt,
  }));
}

/**
 * Lấy danh sách truyện Đã hoàn thành (Trong Bookmark hoặc Lịch sử đọc có status = COMPLETED)
 */
export async function getCompletedStories(userId: string) {
  // Lấy từ lịch sử đọc
  const history = await prisma.readingHistory.findMany({
    where: {
      userId,
      Story: {
        status: "COMPLETED",
      },
    },
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
  });

  return history;
}
