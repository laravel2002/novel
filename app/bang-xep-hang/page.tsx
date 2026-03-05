import { Suspense } from "react";
import {
  getLeaderboard,
  LeaderboardCategory,
  LeaderboardTimeframe,
} from "@/services/leaderboard";
import { RankingUI as RankingListUI } from "@/features/ranking/components/RankingUI";
import StoryListItemSkeleton from "@/features/story/components/shared/StoryListItemSkeleton";
import { LeaderboardFilters } from "@/features/ranking/components/LeaderboardFilters";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng | AntiGravity",
  description:
    "Bảng xếp hạng những tác phẩm nổi bật nhất, được cộng đồng độc giả yêu thích và đánh giá cao.",
};

export const revalidate = 3600; // Cache for 1 hour

interface PageProps {
  searchParams: Promise<{
    category?: string;
    timeframe?: string;
    page?: string;
  }>;
}

async function LeaderboardList({
  category,
  timeframe,
  page,
}: {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  page: number;
}) {
  const data = await getLeaderboard({
    category,
    timeframe,
    limit: 20,
    page,
  });

  if (data.stories.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-border/50">
        <p className="text-lg">Chưa có dữ liệu cho tiêu chí xếp hạng này.</p>
        <p className="text-sm mt-2 opacity-70">Hãy quay lại sau nhé!</p>
      </div>
    );
  }

  // Map to match StoryListItem interface
  const mappedStories = data.stories.map((s: any) => ({
    ...s,
    rating: s.rating ?? 0,
    totalChapters: s.chapterCount ?? 0,
    categories: s.categories || [],
    updatedAt: new Date(),
  }));

  const isFirstPage = page === 1;

  return (
    <RankingListUI
      mappedStories={mappedStories}
      isFirstPage={isFirstPage}
      page={page}
    />
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative">
          <div className="absolute top-0 right-4 w-11 h-11 bg-muted rounded-full z-20 border-[3px] border-background animate-pulse transform -translate-y-1/2" />
          <StoryListItemSkeleton />
        </div>
      ))}
    </div>
  );
}

export default async function LeaderboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentCategory =
    (searchParams.category as LeaderboardCategory) || "views";
  const currentTimeframe =
    (searchParams.timeframe as LeaderboardTimeframe) || "all-time";
  const currentPage = Number(searchParams.page) || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner - Editorial Style */}
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
            <span className="text-[#d97757] font-sans font-bold tracking-[0.2em] text-xs uppercase px-4 py-1.5 rounded-full border border-[#d97757]/30 bg-[#d97757]/10">
              Ranking
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-[#faf9f5] font-bold tracking-tight">
              Bảng Xếp Hạng
            </h1>
            <p className="text-[#b0aea5] max-w-2xl mx-auto text-lg md:text-xl font-medium">
              Khám phá những tác phẩm nổi bật nhất được cộng đồng độc giả bình
              chọn và yêu thích.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-7xl">
        <Suspense
          fallback={
            <div className="h-20 w-full animate-pulse bg-muted rounded-xl mb-6"></div>
          }
        >
          <LeaderboardFilters />
        </Suspense>

        <div className="mt-8 md:mt-16 transition-opacity duration-500 min-h-[500px]">
          <Suspense fallback={<ListSkeleton />}>
            <LeaderboardList
              category={currentCategory}
              timeframe={currentTimeframe}
              page={currentPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
