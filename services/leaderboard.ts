import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { cachePrismaQuery } from "@/lib/cache";

const DAILY_KEY = () => {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `leaderboard:daily:${date}`;
};

const WEEKLY_KEY = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `leaderboard:weekly:${d.getUTCFullYear()}-W${weekNo}`;
};

const MONTHLY_KEY = () => {
  const date = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `leaderboard:monthly:${date}`;
};

export async function recordStoryView(storyId: number) {
  if (!redis) return;

  try {
    const dailyKey = DAILY_KEY();
    const weeklyKey = WEEKLY_KEY();
    const monthlyKey = MONTHLY_KEY();

    const pipeline = redis.pipeline();

    // Tăng điểm view bằng 1
    pipeline.zincrby(dailyKey, 1, storyId.toString());
    pipeline.zincrby(weeklyKey, 1, storyId.toString());
    pipeline.zincrby(monthlyKey, 1, storyId.toString());

    // Cài đặt thời gian hết hạn (TTL) nếu là lần đầu tạo key
    pipeline.expire(dailyKey, 2 * 24 * 60 * 60);
    pipeline.expire(weeklyKey, 10 * 24 * 60 * 60);
    pipeline.expire(monthlyKey, 40 * 24 * 60 * 60);

    await pipeline.exec();
  } catch (error) {
    console.error("Lỗi khi ghi nhận view vào Redis:", error);
  }
}

// Hàm lấy Story ID và View count từ Redis
export async function getLeaderboardRankings(
  timeframe: "daily" | "weekly" | "monthly",
  limit = 10,
) {
  if (!redis) return [];

  let key = "";
  if (timeframe === "daily") key = DAILY_KEY();
  else if (timeframe === "weekly") key = WEEKLY_KEY();
  else if (timeframe === "monthly") key = MONTHLY_KEY();

  try {
    const result = await redis.zrange(key, 0, limit - 1, {
      rev: true,
      withScores: true,
    });

    const leaderboard: { storyId: number; rankViews: number }[] = [];
    for (let i = 0; i < result.length; i += 2) {
      leaderboard.push({
        storyId: parseInt(result[i] as string, 10),
        rankViews: result[i + 1] as number,
      });
    }

    return leaderboard;
  } catch (error) {
    console.error("Lỗi khi lấy Bảng xếp hạng từ Redis:", error);
    return [];
  }
}

// Bóc tách API trả về Object Truyện thật Prisma, sắp xếp theo Redis
export async function getLeaderboardStories(
  timeframe: "daily" | "weekly" | "monthly",
  limit = 20,
) {
  const rankings = await getLeaderboardRankings(timeframe, limit);

  // Nếu môi trường KHÔNG có Redis (rankings rỗng), ta sẽ Fake bằng việc lấy top từ Prisma DB
  if (rankings.length === 0) {
    const fallbackStories = await prisma.story.findMany({
      take: limit,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        author: true,
        status: true,
        views: true,
        rating: true,
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
    });

    return fallbackStories.map((story: any) => ({
      ...story,
      rankViews: story.views, // Sử dụng toàn thời gian view
      totalChapters: story._count.Chapter,
      categories: story.StoryCategory.map((sc: any) => sc.Category),
    }));
  }

  // Tích hợp Redis x Prisma
  const storyIds = rankings.map((r) => r.storyId);
  const stories = await prisma.story.findMany({
    where: { id: { in: storyIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      status: true,
      views: true,
      rating: true,
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
  });

  // Map lại để giữ đúng thứ tự từ Redis và ghép `rankViews`
  const storyMap = new Map();
  stories.forEach((story: any) => {
    storyMap.set(story.id, {
      ...story,
      totalChapters: story._count.Chapter,
      categories: story.StoryCategory.map((sc: any) => sc.Category),
    });
  });

  return rankings
    .map((rank) => {
      const story = storyMap.get(rank.storyId);
      if (!story) return null;
      return { ...story, rankViews: rank.rankViews };
    })
    .filter(Boolean); // Lọc bỏ nếu truyện bị xóa khỏi DB
}

export type LeaderboardCategory =
  | "views"
  | "votes"
  | "donates"
  | "trending"
  | "bookmarks"
  | "comments";

export type LeaderboardTimeframe = "daily" | "weekly" | "monthly" | "all-time";
export type GenderFilter = "all" | "male" | "female"; // Tùy chọn phân luồng
export type StatusFilter = "all" | "ongoing" | "completed";

export interface LeaderboardFilter {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  gender?: GenderFilter;
  genreSlug?: string;
  status?: StatusFilter;
  limit?: number;
  page?: number;
}

export interface LeaderboardStory {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  views: number;
  votes: number;
  donations: number;
  trendingScore: number;
  rating: number;
  chapterCount: number;
  status: "ONGOING" | "COMPLETED" | "PAUSED";
  categories: { id: number; name: string; slug: string }[];
  primaryStat: number; // Statistic value being sorted on
}

export interface LeaderboardResponse {
  stories: LeaderboardStory[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getLeaderboard({
  category,
  timeframe = "all-time",
  gender = "all",
  genreSlug,
  status = "all",
  limit = 20,
  page = 1,
}: LeaderboardFilter): Promise<LeaderboardResponse> {
  const skip = (page - 1) * limit;

  // Xây dựng câu truy vấn theo bộ lọc thời gian
  let dateFilter = {};
  if (timeframe !== "all-time") {
    const now = new Date();
    let startDate = new Date();
    if (timeframe === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === "weekly") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    }
    dateFilter = { date: { gte: startDate } };
  }

  // Khởi tạo where clause cho Story
  let storyWhere: any = {};

  if (status === "ongoing") storyWhere.status = "ONGOING";
  if (status === "completed") storyWhere.status = "COMPLETED";

  // TODO: Tạm thời chưa tích hợp kỹ Category Nam/Nữ vào DB nên mock up
  // Sẽ tích hợp filter Thể loại (Genre)
  if (genreSlug) {
    storyWhere.StoryCategory = {
      some: {
        Category: {
          slug: genreSlug,
        },
      },
    };
  }

  // Khởi tạo Order By
  let orderBy: any = {};

  let stories = [];
  let total = 0;

  // Lấy dữ liệu All-Time (trực tiếp từ bảng Story)
  if (timeframe === "all-time") {
    switch (category) {
      case "views":
        orderBy = { views: "desc" };
        break;
      case "votes":
        orderBy = { votes: "desc" };
        break;
      case "donates":
        orderBy = { donations: "desc" };
        break;
      case "trending":
        orderBy = { trendingScore: "desc" };
        break;
      case "bookmarks":
        // Phải viết raw query hoặc sort bằng Prisma
        // Hiện tại tạm mock up count từ bảng Bookmark
        orderBy = { views: "desc" }; // Cần cập nhật sau với relation count
        break;
      case "comments":
        orderBy = { views: "desc" }; // Cần cập nhật sau
        break;
      default:
        orderBy = { views: "desc" };
    }

    // Nếu category cần count (bookmarks, comments), cần logic riêng.
    // Tuy nhiên, để đơn giản cho MVP, ta có thể dùng views hoặc các trường có sẵn.
    // Sẽ cập nhật Prisma Schema để cache số lượng này vào bảng Story nếu cần.

    if (category === "bookmarks") {
      orderBy = { Bookmark: { _count: "desc" } };
    } else if (category === "comments") {
      orderBy = { Comment: { _count: "desc" } };
    }

    const cacheKeyAllTime = `leaderboard-all-time-${category}-${gender}-${genreSlug || "none"}-${status}-${limit}-${page}`;
    [stories, total] = await cachePrismaQuery(
      async () => {
        return await Promise.all([
          prisma.story.findMany({
            where: storyWhere,
            orderBy,
            take: limit,
            skip,
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              author: true,
              views: true,
              rating: true,
              votes: true,
              donations: true,
              trendingScore: true,
              chapterCount: true,
              status: true,
              StoryCategory: {
                take: 3,
                select: {
                  Category: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
              _count: {
                select: { Bookmark: true, Comment: true },
              },
            },
          }),
          prisma.story.count({ where: storyWhere }),
        ]);
      },
      [cacheKeyAllTime],
      { revalidate: 3600, tags: ["leaderboard"] }
    );
  }
  // Lấy dữ liệu theo thời gian (từ bảng StoryStat)
  else {
    let statField = "views"; // Mặc định
    switch (category) {
      case "views":
        statField = "views";
        break;
      case "votes":
        statField = "votes";
        break;
      case "donates":
        statField = "donations";
        break;
      case "bookmarks":
        statField = "bookmarks";
        break;
      case "comments":
        statField = "comments";
        break;
      case "trending":
        statField = "views";
        break; // Trending hiện dùng views làm fallback
    }

    const cacheKeyTimeframe = `leaderboard-timeframe-${category}-${timeframe}-${gender}-${genreSlug || "none"}-${status}-${limit}-${page}`;
    const cachedResult = await cachePrismaQuery(
      async () => {
        // Nhóm và tính tổng stat trong khoảng thời gian
        const stats = await prisma.storyStat.groupBy({
          by: ["storyId"],
          where: {
            ...dateFilter,
            Story: storyWhere, // Apply các filter cho Story (status, genre...)
          },
          _sum: {
            [statField]: true,
          },
          orderBy: {
            _sum: {
              [statField]: "desc",
            },
          },
          take: limit,
          skip,
        });

        const totalStats = await prisma.storyStat.groupBy({
          by: ["storyId"],
          where: {
            ...dateFilter,
            Story: storyWhere,
          },
        });
        const currentTotal = totalStats.length;

        let currentStories: any[] = [];
        const storyIds = stats.map((s) => s.storyId);

        if (storyIds.length > 0) {
          const detailedStories = await prisma.story.findMany({
            where: { id: { in: storyIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              author: true,
              views: true,
              rating: true,
              votes: true,
              donations: true,
              trendingScore: true, // Tổng toàn thời gian
              chapterCount: true,
              status: true,
              StoryCategory: {
                take: 3,
                select: {
                  Category: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
              _count: {
                select: { Bookmark: true, Comment: true },
              },
            },
          });

          const storyMap = new Map(detailedStories.map((s: any) => [s.id, s]));

          currentStories = stats
            .map((stat: any) => {
              const story = storyMap.get(stat.storyId);
              if (!story) return null;

              return {
                ...story,
                _periodValue: stat._sum[statField as "views" | "votes" | "donations" | "comments" | "bookmarks"] || 0,
              };
            })
            .filter(Boolean);
        }
        return { stories: currentStories, total: currentTotal };
      },
      [cacheKeyTimeframe],
      { revalidate: 3600, tags: ["leaderboard"] }
    );

    stories = cachedResult.stories;
    total = cachedResult.total;
  }

  // Format lại output cho đồng nhất
  const formattedStories = stories.map((s: any) => {
    let primaryStat = s.views;

    // Nếu có _periodValue (query theo thời gian), ưu tiên dùng nó
    if (s._periodValue !== undefined) {
      primaryStat = s._periodValue as number;
    } else {
      // Query All-time
      switch (category) {
        case "views":
          primaryStat = s.views;
          break;
        case "votes":
          primaryStat = s.votes;
          break;
        case "donates":
          primaryStat = s.donations;
          break;
        case "trending":
          primaryStat = s.trendingScore;
          break;
        case "bookmarks":
          primaryStat = s._count?.Bookmark || 0;
          break;
        case "comments":
          primaryStat = s._count?.Comment || 0;
          break;
      }
    }

    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      coverUrl: s.coverUrl,
      author: s.author,
      views: s.views,
      rating: s.rating ?? 0,
      votes: s.votes,
      donations: s.donations,
      trendingScore: s.trendingScore,
      chapterCount: s.chapterCount,
      status: s.status,
      categories: s.StoryCategory
        ? s.StoryCategory.map((sc: any) => sc.Category)
        : [],
      primaryStat, // Giá trị hiển thị tại component UI
    };
  });

  return {
    stories: formattedStories as LeaderboardStory[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
