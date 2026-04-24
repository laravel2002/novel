"use client";

import BaseSkeleton from "./BaseSkeleton";

/**
 * SearchSkeleton - Skeleton cho dropdown kết quả tìm kiếm nhanh.
 */
export default function SearchSkeleton() {
  return (
    <div className="space-y-1">
      {/* Search Header Skeleton */}
      <div className="px-3 py-2 border-b border-border/50 mb-2 flex justify-between items-center">
        <BaseSkeleton className="w-24 h-3 rounded-sm" />
        <BaseSkeleton className="w-8 h-4 rounded-full" />
      </div>

      {/* Result Items Skeleton */}
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center p-2 rounded-xl h-20">
            <BaseSkeleton className="w-11 h-16 shrink-0 rounded-md" />
            <div className="ml-3.5 flex-1 space-y-2">
              <BaseSkeleton className="w-3/4 h-4 rounded-md" />
              <BaseSkeleton className="w-1/2 h-3 rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="pt-2 pb-1 mt-2 border-t border-border/40 flex justify-center">
        <BaseSkeleton className="w-40 h-4 rounded-md" />
      </div>
    </div>
  );
}
