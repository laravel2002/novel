import { prisma } from "@/lib/prisma";
import { Status } from "@/generated/prisma/client";

export interface PaginationParams {
  limit?: number;
  cursor?: number; // Vị trí (id) bắt đầu lấy dữ liệu cho trang tiếp theo
  categoryId?: number;
  categorySlug?: string;
  status?: Status;
  sortBy?: "views" | "updatedAt" | "rating";
}

export async function getStoriesPaginated({
  limit = 20,
  cursor,
  categoryId,
  categorySlug,
  status,
  sortBy = "views",
}: PaginationParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  if (categoryId) {
    whereClause.StoryCategory = {
      some: { categoryId: categoryId },
    };
  } else if (categorySlug) {
    whereClause.StoryCategory = {
      some: {
        Category: { slug: categorySlug },
      },
    };
  }

  if (status) {
    whereClause.status = status;
  }

  const stories = await prisma.story.findMany({
    take: limit + 1, // Lọc thừa 1 phần tử để xác định xem có trang tiếp theo không
    cursor: cursor ? { id: cursor } : undefined,
    where: whereClause,
    orderBy: {
      [sortBy]: "desc", // Có thể cần sort kết hợp nếu values bị trùng lặp nhiều
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      author: true,
      status: true,
      rating: true,
      views: true,
      description: true,
      updatedAt: true,
      _count: {
        select: { Chapter: true },
      },
      StoryCategory: {
        take: 1,
        select: {
          Category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (stories.length > limit) {
    const nextItem = stories.pop(); // Xóa phần tử thừa ra khỏi mảng hiển thị
    nextCursor = nextItem!.id;
  }

  const formattedStories = stories.map((story) => ({
    ...story,
    rating: story.rating ?? 0,
    totalChapters: story._count.Chapter,
    categories: story.StoryCategory.map((sc) => sc.Category).filter(Boolean),
  }));

  return {
    data: formattedStories,
    nextCursor,
  };
}

// Lấy danh sách TẤT CẢ thể loại
export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

// Lấy Chi tiết một thể loại qua Slug
export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
  });
}
