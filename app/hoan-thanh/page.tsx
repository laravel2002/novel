import { Suspense } from "react";
import { Metadata } from "next";
import { getStoriesPaginated, getAllCategories } from "@/services/discovery";
import { Status } from "@/generated/prisma/client";
import StoryListItem from "@/features/story/components/shared/StoryListItem";
import StoryListItemSkeleton from "@/features/story/components/shared/StoryListItemSkeleton";
import { CompletedFilters } from "@/features/library/components/CompletedFilters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Sparkles, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Truyện Đã Hoàn Thành (Full) | AntiGravity",
  description:
    "Danh sách truyện chữ đã hoàn thành (full) được cập nhật liên tục với giao diện cao cấp.",
};

// 1 Hour ISR
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    cursor?: string;
    category?: string;
    sort?: "views" | "updatedAt" | "rating";
  }>;
}

interface MappedStory {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  status: Status;
  updatedAt: Date;
  views: number;
  rating: number;
  description: string | null;
  totalChapters: number;
  categories: { id: number; name: string; slug: string }[];
}

async function CompletedStoriesList({
  category,
  sort,
  cursor,
}: {
  category?: string;
  sort: "views" | "updatedAt" | "rating";
  cursor?: number;
}) {
  const result = await getStoriesPaginated({
    status: Status.COMPLETED,
    categorySlug: category,
    limit: 20,
    cursor: cursor,
    sortBy: sort,
  });

  const stories = result.data as unknown as MappedStory[];
  const nextCursor = result.nextCursor;

  if (stories.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4 border border-border/50">
          <Filter className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-bold text-muted-foreground">
          Chưa có dữ liệu cho tiêu chí này.
        </p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          Hãy thử thay đổi bộ lọc hoặc quay lại sau nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
        {stories.map((story, index) => (
          <div key={story.id} className="relative group">
            <StoryListItem story={story} index={index} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="flex justify-center mt-12 pb-10">
          <Link
            href={`/hoan-thanh?sort=${sort}${category ? `&category=${category}` : ""}&cursor=${nextCursor}`}
          >
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 h-auto font-bold border-2 border-[#d97757]/20 hover:border-[#d97757]/50 transition-all hover:bg-[#d97757]/5 flex items-center gap-2 group"
            >
              Xem Thêm Kết Quả
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <StoryListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function CompletedPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category;
  const currentSort = searchParams.sort || "updatedAt";
  const currentCursor = searchParams.cursor
    ? parseInt(searchParams.cursor, 10)
    : undefined;

  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative py-16 md:py-24 overflow-hidden mb-8 border-b border-primary/10 bg-[#141413]">
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-[#34d399] font-sans font-bold tracking-[0.2em] text-xs uppercase px-4 py-1.5 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed & Full
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-[#faf9f5] font-bold tracking-tight">
              Truyện Hoàn Thành
            </h1>
            <p className="text-[#b0aea5] max-w-2xl mx-auto text-lg md:text-xl font-medium">
              Tất cả những tinh hoa đã kết thúc trọn vẹn. Khám phá ngay những
              siêu phẩm không cần chờ đợi.
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 opacity-20 hidden lg:block">
          <Sparkles className="w-12 h-12 text-[#34d399]" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-20 hidden lg:block">
          <Sparkles className="w-12 h-12 text-[#34d399]" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-7xl">
        <Suspense
          fallback={
            <div className="h-40 w-full animate-pulse bg-muted rounded-2xl mb-8"></div>
          }
        >
          <CompletedFilters categories={categories} />
        </Suspense>

        <div className="mt-8 min-h-[500px]">
          <Suspense fallback={<ListSkeleton />}>
            <CompletedStoriesList
              category={currentCategory}
              sort={currentSort}
              cursor={currentCursor}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
