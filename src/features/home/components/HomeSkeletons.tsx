import StoryCardSkeleton from "@/features/ranking/components/StoryCardSkeleton";
import { RankingListSkeleton } from "@/features/ranking/components/RankingItemSkeleton";
import RankingItemSkeleton from "@/features/ranking/components/RankingItemSkeleton";
import {
  FeaturedCompletedSkeleton,
  GridCompletedSkeleton,
} from "@/features/library/components/CompletedStorySkeleton";

export function HeroBannerSkeleton() {
  return (
    <div className="w-full min-h-[500px] md:min-h-[540px] rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5" />
  );
}

export function LatestUpdatesSkeleton() {
  return (
    <section className="relative w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end relative">
        <div className="w-48 h-10 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function SidebarRankingsSkeleton() {
  return (
    <aside className="w-full flex flex-col gap-10 sticky top-24 pt-2">
      <RankingListSkeleton />
      <RankingListSkeleton />
    </aside>
  );
}

export function ThreeColRankingsSkeleton() {
  return (
    <section className="relative w-full pt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-48 h-8 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-[#111113] rounded-2xl p-5 border border-white/5"
          >
            <div className="w-32 h-5 bg-white/10 rounded mb-5 animate-pulse" />
            <div className="flex flex-col space-y-1">
              <RankingItemSkeleton isTop1={true} />
              {Array.from({ length: 9 }).map((_, i) => (
                <RankingItemSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompletedStoriesSkeleton() {
  return (
    <section className="relative w-full pt-10 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="w-64 h-8 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5">
          <FeaturedCompletedSkeleton />
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          {Array.from({ length: 8 }).map((_, idx) => (
            <GridCompletedSkeleton key={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
