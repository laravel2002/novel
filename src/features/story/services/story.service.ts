import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export interface GetStoriesParams {
  page?: number;
  limit?: number;
  status?: "ONGOING" | "COMPLETED" | "PAUSED";
  categoryId?: number;
  orderBy?: "views" | "createdAt" | "votes";
}

export interface GetStoriesResult {
  stories: Prisma.StoryGetPayload<{
    select: {
      id: true;
      title: true;
      author: true;
      coverUrl: true;
      views: true;
      status: true;
      chapterCount: true;
    }
  }>[];
  total: number;
}

export const StoryService = {
  /**
   * Lấy danh sách truyện có phân trang
   * Phục vụ cho cả API Web và Mobile, chỉ trả về các trường cần thiết.
   */
  async getStories(params: GetStoriesParams): Promise<GetStoriesResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const whereInput: Prisma.StoryWhereInput = {};

    if (params.status) {
      whereInput.status = params.status;
    }

    if (params.categoryId) {
      whereInput.StoryCategory = {
        some: {
          categoryId: params.categoryId
        }
      };
    }

    let orderByInput: Prisma.StoryOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.orderBy === 'views') {
      orderByInput = { views: 'desc' };
    } else if (params.orderBy === 'votes') {
      orderByInput = { votes: 'desc' };
    }

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: whereInput,
        orderBy: orderByInput,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
          views: true,
          status: true,
          chapterCount: true,
        }
      }),
      prisma.story.count({
        where: whereInput
      })
    ]);

    return {
      stories,
      total
    };
  },

  /**
   * Lấy chi tiết một truyện dựa trên slug
   */
  async getStoryDetail(slug: string) {
    if (!slug) return null;

    const story = await prisma.story.findUnique({
      where: { slug },
      include: {
        StoryCategory: {
          include: {
            Category: true
          }
        },
        _count: {
          select: { Chapter: true }
        }
      }
    });

    if (!story) return null;

    return {
      ...story,
      categories: story.StoryCategory.map(sc => sc.Category),
      totalChapters: story._count.Chapter
    };
  }
};

export const CategoryService = {
  /**
   * Lấy danh sách tất cả thể loại
   */
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  }
};
