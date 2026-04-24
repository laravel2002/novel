"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

/**
 * StoryCardSkeleton - Skeleton cho card truyện hàng ngang (Sử dụng trong LatestUpdates)
 */
export default function StoryCardSkeleton() {
  return (
    <div className="flex items-stretch gap-4 rounded-xl border border-white/5 bg-[#0f0f12]/80 p-3 min-h-[140px]">
      {/* Thumbnail Left */}
      <BaseSkeleton className="w-[90px] min-w-[90px] h-full shrink-0 rounded-md shadow-md" />

      {/* Content Right */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
        <div className="space-y-3">
          {/* Badge & Category */}
          <div className="flex items-center gap-2">
            <BaseSkeleton className="w-16 h-4 rounded-sm" />
            <BaseSkeleton className="w-20 h-4 rounded-sm" />
          </div>

          {/* Title */}
          <BaseSkeleton className="w-3/4 h-5 rounded-md" />

          {/* Description */}
          <div className="space-y-1.5">
            <BaseSkeleton className="w-full h-3 rounded-sm" />
            <BaseSkeleton className="w-5/6 h-3 rounded-sm" />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
          <div className="flex items-center gap-1.5 w-1/2">
            <BaseSkeleton className="w-4 h-4 rounded-full" />
            <BaseSkeleton className="w-24 h-3 rounded-sm" />
          </div>
          <BaseSkeleton className="w-12 h-4 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
