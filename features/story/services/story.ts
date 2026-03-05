import { prisma } from "@/lib/prisma";
import { Status } from "@/generated/prisma/client";
import { unstable_cache } from "next/cache"; // Đảm bảo import đúng đường dẫn generated
import { recordStoryView } from "@/services/leaderboard";

// Hàm lấy danh sách truyện mới cập nhật (Latest Updates)
// Sắp xếp theo thời gian cập nhật giảm dần (mới nhất lên đầu)
const _getLatestUpdates = async (limit = 15) => {
  const stories = await prisma.story.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      status: true,
      updatedAt: true,
      description: true, // Lấy thêm mô tả ngắn cho card
      StoryCategory: {
        take: 1, // Chỉ lấy 1 category đầu tiên để hiển thị
        select: {
          Category: {
            select: { name: true, slug: true },
          },
        },
      },
    },
  });

  // Map lại dữ liệu để dễ sử dụng ở frontend
  return stories.map((story) => ({
    ...story,
    category: story.StoryCategory[0]?.Category,
  }));
};
export const getLatestUpdates = unstable_cache(
  _getLatestUpdates,
  ["latest-updates"],
  { revalidate: 3600, tags: ["home", "story"] },
);

// Hàm lấy danh sách truyện xem nhiều nhất (Top Views)
// Sắp xếp theo lượt xem giảm dần
const _getTopStoriesByViews = async (limit = 10) => {
  const stories = await prisma.story.findMany({
    take: limit,
    orderBy: { views: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      views: true,
      status: true,
      rating: true,
      // Lấy danh sách thể loại phải đi qua bảng trung gian StoryCategory
      StoryCategory: {
        select: {
          Category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      // Đếm tổng số chương hiện có bằng cách trỏ vào relation Chapter
      _count: {
        select: {
          Chapter: true,
        },
      },
    },
  });

  return stories;
};
export const getTopStoriesByViews = unstable_cache(
  _getTopStoriesByViews,
  ["top-views"],
  { revalidate: 3600, tags: ["home", "story"] },
);

// Hàm lấy danh sách truyện được đánh giá cao nhất (Top Rating / Đề cử)
// Sắp xếp theo điểm đánh giá giảm dần
const _getTopStoriesByRating = async (limit = 10) => {
  const stories = await prisma.story.findMany({
    take: limit,
    orderBy: { rating: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      views: true,
      rating: true,
      StoryCategory: {
        take: 1,
        select: {
          Category: {
            select: { name: true },
          },
        },
      },
    },
  });

  return stories.map((story) => ({
    ...story,
    category: story.StoryCategory[0]?.Category,
  }));
};
export const getTopStoriesByRating = unstable_cache(
  _getTopStoriesByRating,
  ["top-rating"],
  { revalidate: 3600, tags: ["home", "story"] },
);

// Hàm lấy danh sách truyện đã hoàn thành (Completed Stories)
// Lọc theo trạng thái COMPLETED và sắp xếp theo thời gian cập nhật
const _getCompletedStories = async (limit = 12) => {
  const stories = await prisma.story.findMany({
    where: {
      status: Status.COMPLETED,
    },
    take: limit,
    orderBy: { updatedAt: "desc" }, // Hoặc views: 'desc' tùy nhu cầu
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      status: true,
      rating: true,
      description: true,
      _count: {
        select: { Chapter: true }, // Đếm số chương để hiển thị
      },
      StoryCategory: {
        take: 1,
        select: {
          Category: {
            select: { name: true },
          },
        },
      },
    },
  });

  return stories.map((story) => ({
    ...story,
    totalChapters: story._count.Chapter,
    category: story.StoryCategory[0]?.Category,
  }));
};
export const getCompletedStories = unstable_cache(
  _getCompletedStories,
  ["completed-stories"],
  { revalidate: 3600, tags: ["home", "story"] },
);

// Hàm lấy chi tiết truyện theo slug
const _getStoryBySlug = async (slug: string) => {
  // Chọn rõ ràng các trường của `story` để tránh tham chiếu tới các cột
  // có thể chưa tồn tại trong database (ví dụ: titleUnaccented).
  const story = await prisma.story.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      description: true,
      coverUrl: true,
      status: true,
      views: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
      StoryCategory: {
        include: { Category: true },
      },
      Chapter: {
        orderBy: { chapterNum: "asc" },
        select: { id: true, chapterNum: true, title: true, createdAt: true },
      },
      _count: { select: { Chapter: true } },
    },
  });

  if (!story) return null;

  return {
    ...story,
    categories: story.StoryCategory.map((sc) => sc.Category),
    chapters: story.Chapter,
    totalChapters: story._count.Chapter,
  };
};
export const getStoryBySlug = unstable_cache(_getStoryBySlug, ["story"], {
  tags: ["story"],
});

// Hàm tìm kiếm truyện theo tiêu đề hoặc tác giả (Full-Text Search)
export async function searchStories(query: string, page = 1, limit = 20) {
  if (!query) return { stories: [], totalCount: 0 };

  const skip = (page - 1) * limit;

  // Chuyển đổi query thành định dạng tsquery: 'tu khoa' -> 'tu&khoa:*'
  const formattedQuery = query.trim().split(/\s+/).join(" & ") + ":*";

  try {
    const [stories, totalCount] = await Promise.all([
      prisma.story.findMany({
        where: {
          OR: [
            {
              title: {
                search: formattedQuery,
              },
            },
            {
              author: {
                search: formattedQuery,
              },
            },
          ],
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          coverUrl: true,
          rating: true,
          views: true,
          status: true,
          updatedAt: true,
          description: true,
          _count: {
            select: { Chapter: true },
          },
          StoryCategory: {
            take: 3,
            select: {
              Category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: {
          views: "desc", // Ưu tiên truyện nổi tiếng khi tìm kiếm
        },
      }),
      prisma.story.count({
        where: {
          OR: [
            {
              title: {
                search: formattedQuery,
              },
            },
            {
              author: {
                search: formattedQuery,
              },
            },
          ],
        },
      }),
    ]);

    return {
      stories: stories.map((story) => ({
        ...story,
        totalChapters: story._count.Chapter,
        categories: story.StoryCategory.map((sc) => sc.Category),
      })),
      totalCount,
    };
  } catch (error) {
    console.error("Search Stories Error:", error);
    // Fallback if full-text search is not configured or fails
    const fallbackStories = await prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        coverUrl: true,
        rating: true,
        views: true,
        status: true,
        updatedAt: true,
        description: true,
        _count: {
          select: { Chapter: true },
        },
        StoryCategory: {
          take: 3,
          select: {
            Category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { views: "desc" },
    });

    const fallbackCount = await prisma.story.count({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    return {
      stories: fallbackStories.map((story) => ({
        ...story,
        totalChapters: story._count.Chapter,
        categories: story.StoryCategory.map((sc) => sc.Category),
      })),
      totalCount: fallbackCount,
    };
  }
}

// Hàm lấy truyện liên quan (cùng thể loại)
export async function getRelatedStories(
  currentStoryId: number,
  categoryIds: number[],
  limit = 6,
) {
  if (categoryIds.length === 0) return [];

  const stories = await prisma.story.findMany({
    where: {
      id: { not: currentStoryId },
      StoryCategory: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    take: limit,
    orderBy: {
      views: "desc", // Ưu tiên truyện nổi tiếng cùng thể loại
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      _count: {
        select: { Chapter: true },
      },
    },
  });

  return stories.map((story) => ({
    ...story,
    totalChapters: story._count.Chapter,
  }));
}

// Hàm lấy nội dung chương truyện
const _getChapterData = async (storySlug: string, chapterNum: number) => {
  const story = await prisma.story.findUnique({
    where: { slug: storySlug },
    select: { id: true, title: true, slug: true, author: true, coverUrl: true },
  });

  if (!story) return null;

  const chapter = await prisma.chapter.findFirst({
    where: {
      storyId: story.id,
      chapterNum: chapterNum,
    },
  });

  if (!chapter) return null;

  // Lấy chương trước và sau để điều hướng
  const [prevChapter, nextChapter] = await Promise.all([
    prisma.chapter.findFirst({
      where: {
        storyId: story.id,
        chapterNum: { lt: chapterNum },
      },
      orderBy: { chapterNum: "desc" },
      select: { chapterNum: true },
    }),
    prisma.chapter.findFirst({
      where: {
        storyId: story.id,
        chapterNum: { gt: chapterNum },
      },
      orderBy: { chapterNum: "asc" },
      select: { chapterNum: true },
    }),
  ]);

  // Lấy danh sách tất cả các chương để làm menu chọn nhanh (chỉ lấy số và tên)
  const allChapters = await prisma.chapter.findMany({
    where: { storyId: story.id },
    orderBy: { chapterNum: "asc" },
    select: { chapterNum: true, title: true },
  });

  return {
    story,
    chapter,
    prevChapter: prevChapter?.chapterNum || null,
    nextChapter: nextChapter?.chapterNum || null,
    chapters: allChapters,
  };
};

export const getChapterDataCached = unstable_cache(
  _getChapterData,
  ["chapter-content"],
  { revalidate: 3600, tags: ["chapter", "story"] },
);

export async function getChapter(storySlug: string, chapterNum: number) {
  const data = await getChapterDataCached(storySlug, chapterNum);
  if (!data) return null;

  // Tăng lượt xem (không await để tiến trình trả về data cho user trước - Optimistic response)
  prisma.chapter
    .update({
      where: { id: data.chapter.id },
      data: { views: { increment: 1 } },
      select: { id: true },
    })
    .catch(() => {});

  prisma.story
    .update({
      where: { id: data.story.id },
      data: { views: { increment: 1 } },
      select: { id: true },
    })
    .catch(() => {});

  // 🔥 MỚI: Tăng Redis Score cho Bảng Xếp Hạng (Leaderboard) - Trạng thái ngầm async
  recordStoryView(data.story.id).catch(() => {});

  return data;
}

// Giữ lại hàm Featured cũ nếu cần, hoặc alias sang TopStoriesByViews
export const getFeaturedStories = getTopStoriesByViews;
export const getLatestStories = getLatestUpdates;

const _getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};
export const getAllCategories = unstable_cache(
  _getAllCategories,
  ["all-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export type SortByOption = "views" | "updatedAt" | "rating" | "newest";

export interface FilterParams {
  categoryId?: number;
  status?: Status;
  sortBy?: SortByOption;
  chapterLength?: "short" | "medium" | "long";
  page?: number;
  limit?: number;
}

const _getFilteredStories = async (params: FilterParams) => {
  const {
    categoryId,
    status,
    sortBy = "updatedAt",
    chapterLength,
    page = 1,
    limit = 20,
  } = params;
  const skip = (page - 1) * limit;

  // Xây dựng điều kiện lọc (where)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (categoryId) {
    where.StoryCategory = {
      some: {
        categoryId,
      },
    };
  }

  if (chapterLength) {
    if (chapterLength === "short") {
      // Dưới 50 chương
      where.chapterCount = { lt: 50 };
    } else if (chapterLength === "medium") {
      // 50 - 200 chương
      where.chapterCount = { gte: 50, lte: 200 };
    } else if (chapterLength === "long") {
      // Trên 200 chương
      where.chapterCount = { gt: 200 };
    }
  }

  // Xây dựng tiêu chí sắp xếp (orderBy)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { updatedAt: "desc" };
  switch (sortBy) {
    case "views":
      orderBy = { views: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "updatedAt":
      orderBy = { updatedAt: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  // Thực hiện truy vấn song song (lấy data và đếm tổng số lượng)
  const [stories, totalCount] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        author: true,
        status: true,
        updatedAt: true,
        views: true,
        rating: true,
        description: true,
        _count: {
          select: { Chapter: true },
        },
        StoryCategory: {
          take: 3, // Lấy tối đa 3 thể loại để hiển thị nhãn
          select: {
            Category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.story.count({ where }),
  ]);

  return {
    stories: stories.map((story) => ({
      ...story,
      totalChapters: story._count.Chapter,
      categories: story.StoryCategory.map((sc) => sc.Category),
    })),
    totalCount,
  };
};

export const getFilteredStories = unstable_cache(
  _getFilteredStories,
  ["filtered-stories"],
  { revalidate: 3600, tags: ["story"] },
);

// Hàm lấy danh sách truyện đang hot (Trending)
const _getTrendingStories = async (limit = 10) => {
  const stories = await prisma.story.findMany({
    take: limit,
    orderBy: { trendingScore: "desc" },
    // Dùng ép kiểu nếu Prisma sinh type chưa chuẩn về rating/author nhưng UI cần
  });
  return stories;
};
export const getTrendingStories = unstable_cache(
  _getTrendingStories,
  ["trending-stories"],
  { revalidate: 3600, tags: ["home", "story"] },
);
