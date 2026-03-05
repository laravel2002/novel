import { Metadata } from "next";
import { CategoryPageUI } from "@/features/story/components/CategoryPageUI";
import {
  getFilteredStories,
  getAllCategories,
  FilterParams,
  SortByOption,
} from "@/features/story/services/story";
import { Status } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Thể loại truyện | Danh sách truyện",
  description: "Lọc và tìm kiếm truyện theo thể loại, lượt xem, cập nhật.",
};

// Next.js 15 yêu cầu searchParams là một Promise
interface TheLoaiPageProps {
  searchParams: Promise<{
    categoryId?: string;
    status?: string;
    sortBy?: string;
    chapterLength?: string;
    page?: string;
  }>;
}

export default async function TheLoaiPage({ searchParams }: TheLoaiPageProps) {
  const params = await searchParams;

  const categoryId = params.categoryId
    ? parseInt(params.categoryId)
    : undefined;
  const status = params.status as Status | undefined;

  const validSortOptions: SortByOption[] = [
    "views",
    "updatedAt",
    "rating",
    "newest",
  ];
  const sortBy: SortByOption = validSortOptions.includes(
    params.sortBy as SortByOption,
  )
    ? (params.sortBy as SortByOption)
    : "updatedAt";

  const page =
    params.page && !isNaN(parseInt(params.page))
      ? Math.max(1, parseInt(params.page))
      : 1;
  const limit = 12;

  const chapterLength = params.chapterLength as
    | "short"
    | "medium"
    | "long"
    | undefined;

  const filterParams: FilterParams = {
    categoryId,
    status,
    sortBy,
    chapterLength,
    page,
    limit,
  };

  const [categories, { stories, totalCount }] = await Promise.all([
    getAllCategories(),
    getFilteredStories(filterParams),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <CategoryPageUI
      categories={categories}
      stories={stories}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      searchParamsProps={{
        categoryId: params.categoryId,
        status: params.status,
        sortBy: params.sortBy,
        chapterLength: params.chapterLength,
      }}
    />
  );
}
