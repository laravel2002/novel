import { Suspense } from "react";
import { getLeaderboard } from "@/services/leaderboard";
import { LeaderboardFilters } from "@/features/ranking/components/LeaderboardFilters";
import { LeaderboardListClient } from "./LeaderboardListClient";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng | AntiGravity",
  description:
    "Bảng xếp hạng những tác phẩm nổi bật nhất, được cộng đồng độc giả yêu thích và đánh giá cao.",
};

export const revalidate = 3600; // Cache for 1 hour

export default async function LeaderboardPage() {
  // Fetch initial data for SSG (category = 'views', timeframe = 'all-time', page = 1)
  const data = await getLeaderboard({
    category: "views",
    timeframe: "all-time",
    limit: 20,
    page: 1,
  });

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
          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted rounded-xl" />}>
            <LeaderboardListClient initialData={data} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
