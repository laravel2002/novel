"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

/**
 * CompletedStorySkeleton - Skeleton cho phần truyện đã hoàn thành.
 */
export function FeaturedCompletedSkeleton() {
  return (
    <div className="w-full h-full rounded-3xl border border-white/5 bg-[#0a100d] p-6 flex flex-col">
      {/* Top Tag */}
      <div className="flex items-center gap-2 mb-6">
        <BaseSkeleton className="w-24 h-4 rounded-sm" />
        <BaseSkeleton className="w-16 h-4 rounded-sm" />
      </div>

      {/* Image Featured */}
      <BaseSkeleton className="aspect-[3/4] w-[180px] mx-auto rounded-xl mb-8" />

      {/* Content */}
      <div className="mt-auto space-y-4">
        <div className="space-y-2">
          <BaseSkeleton className="w-full h-7 rounded-md" />
          <BaseSkeleton className="w-2/3 h-7 rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <BaseSkeleton className="w-20 h-3 rounded-sm" />
          <BaseSkeleton className="w-16 h-3 rounded-sm" />
        </div>

        <div className="space-y-1.5">
          <BaseSkeleton className="w-full h-3 rounded-sm" />
          <BaseSkeleton className="w-5/6 h-3 rounded-sm" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <BaseSkeleton className="w-24 h-4 rounded-sm" />
          <BaseSkeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GridCompletedSkeleton() {
  return (
    <div className="flex gap-4 p-3 bg-[#111113] rounded-xl border border-white/5 h-[124px]">
      <BaseSkeleton className="w-[72px] h-[100px] shrink-0 rounded-md" />
      <div className="flex flex-col justify-between py-1 flex-1">
        <div className="space-y-2">
          <div className="flex gap-2">
            <BaseSkeleton className="w-16 h-3 rounded-sm" />
            <BaseSkeleton className="w-12 h-3 rounded-sm" />
          </div>
          <BaseSkeleton className="w-full h-4 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <BaseSkeleton className="w-20 h-3 rounded-sm" />
          <BaseSkeleton className="w-10 h-3 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
