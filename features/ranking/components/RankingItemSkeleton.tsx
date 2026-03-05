"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

/**
 * RankingItemSkeleton - Skeleton cho từng dòng trong bảng xếp hạng.
 * @param isTop1 - Nếu là hạng 1, hiển thị layout lớn có thumbnail.
 */
export default function RankingItemSkeleton({
  isTop1 = false,
}: {
  isTop1?: boolean;
}) {
  if (isTop1) {
    return (
      <div className="flex items-center gap-4 bg-[#111113] p-3 rounded-xl border border-white/5 mb-4">
        {/* Thumbnail Rank 1 */}
        <BaseSkeleton className="w-14 h-20 shrink-0 rounded-md" />

        {/* Content Rank 1 */}
        <div className="flex flex-col flex-1 justify-center space-y-2">
          <BaseSkeleton className="w-full h-5 rounded-md" />
          <BaseSkeleton className="w-1/2 h-3 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-2">
      <BaseSkeleton className="w-5 h-5 rounded-sm shrink-0" />
      <BaseSkeleton className="flex-1 h-4 rounded-sm" />
      <BaseSkeleton className="w-12 h-3 rounded-sm shrink-0" />
    </div>
  );
}

/**
 * RankingListSkeleton - Skeleton cho cả một bảng xếp hạng (10 dòng)
 */
export function RankingListSkeleton() {
  return (
    <div className="flex flex-col w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <BaseSkeleton className="w-32 h-5 rounded-md" />
        <BaseSkeleton className="w-12 h-3 rounded-sm" />
      </div>

      {/* List items */}
      <div className="flex flex-col">
        <RankingItemSkeleton isTop1={true} />
        {Array.from({ length: 9 }).map((_, idx) => (
          <RankingItemSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
