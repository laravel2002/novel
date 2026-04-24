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
  // Loại bỏ searchParams để Next.js pre-render trang này dưới dạng SSG
}

export default async function TheLoaiPage() {
  // Mặc định load trang đầu tiên ở Server
  const filterParams: FilterParams = {
    page: 1,
    limit: 12,
    sortBy: "updatedAt",
  };

  const [categories, { stories, totalCount }] = await Promise.all([
    getAllCategories(),
    getFilteredStories(filterParams),
  ]);

  const limit = 12;
  const page = 1;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <CategoryPageUI
      categories={categories}
      stories={stories}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      searchParamsProps={{}} // Pass empty, we'll parse in client
    />
  );
}
