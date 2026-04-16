import { prisma } from "@/lib/prisma";

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
}

export const SearchService = {
  /**
   * Tìm kiếm truyện theo tiêu đề hoặc tác giả
   */
  async search(params: SearchParams) {
    const { query, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    if (!query.trim()) {
      return { stories: [], total: 0 };
    }

    // Sử dụng logic contains (mode: insensitive) làm fallback tin cậy
    // vì không phải DB nào cũng config Full Text Search ngay từ đầu.
    const whereInput = {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { author: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: whereInput,
        skip,
        take: limit,
        orderBy: { views: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          coverUrl: true,
          status: true,
          views: true,
          rating: true,
          updatedAt: true,
        },
      }),
      prisma.story.count({ where: whereInput }),
    ]);

    return {
      stories,
      total,
    };
  },

  /**
   * Tìm kiếm truyện với format dành riêng cho Mobile App.
   * Map lại field names: coverUrl → coverImage để phù hợp convention Mobile.
   */
  async searchForMobile(params: SearchParams) {
    const result = await this.search(params);

    const formattedStories = result.stories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      coverImage: s.coverUrl,
      author: s.author,
      status: s.status,
      updatedAt: s.updatedAt,
    }));

    return {
      stories: formattedStories,
      total: result.total,
    };
  },
};
