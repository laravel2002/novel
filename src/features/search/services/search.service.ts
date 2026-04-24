import { prisma } from "@/lib/prisma";

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
}

// Hàm hỗ trợ chuyển đổi Tiếng Việt có dấu thành không dấu và thay khoảng trắng thành dấu gạch ngang (giống slug)
function createSearchSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D") // Đổi chữ đ
    .trim()
    .replace(/\s+/g, "-"); // Thay khoảng trắng bằng gạch ngang
}

export const SearchService = {
  /**
   * Tìm kiếm truyện theo tiêu đề hoặc tác giả (Hỗ trợ gõ KHÔNG DẤU)
   */
  async search(params: SearchParams) {
    const { query, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { stories: [], total: 0 };
    }

    // Tạo từ khóa tìm kiếm dạng slug (ví dụ: "Hào môn" -> "hao-mon")
    const searchSlug = createSearchSlug(trimmedQuery);

    const whereInput = {
      OR: [
        // 1. Tìm chính xác theo những gì người dùng gõ (có dấu)
        { title: { contains: trimmedQuery, mode: "insensitive" as const } },
        { author: { contains: trimmedQuery, mode: "insensitive" as const } },

        // 2. Tìm theo Slug để hỗ trợ trường hợp gõ KHÔNG DẤU
        { slug: { contains: searchSlug, mode: "insensitive" as const } },
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
   */
  async searchForMobile(params: SearchParams) {
    const result = await this.search(params);

    const formattedStories = result.stories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      coverImage: s.coverUrl,
      author: s.author,
      // Map thêm các trường nếu Mobile cần
      views: s.views,
      status: s.status,
    }));

    return {
      stories: formattedStories,
      total: result.total,
    };
  },
};
