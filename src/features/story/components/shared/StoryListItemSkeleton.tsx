"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

/**
 * StoryListItemSkeleton - Skeleton cho card truyện dọc (Full breed)
 * Sử dụng trong danh sách truyện, trang thể loại và tìm kiếm.
 */
export default function StoryListItemSkeleton() {
  return (
    <div className="relative flex flex-col h-[400px] sm:h-[430px] w-full bg-[#141413] border border-white/5 rounded-[1.25rem] overflow-hidden">
      {/* Background Skeleton */}
      <BaseSkeleton className="absolute inset-0 w-full h-full opacity-40" />

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-1.5">
          <BaseSkeleton className="w-20 h-5 rounded-sm" />
          <BaseSkeleton className="w-16 h-5 rounded-sm" />
        </div>
        <BaseSkeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Bottom Content Area */}
      <div className="flex flex-col justify-end flex-1 p-5 z-10">
        <div className="mt-auto space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <BaseSkeleton className="w-full h-6 rounded-md" />
            <BaseSkeleton className="w-2/3 h-6 rounded-md" />
          </div>

          {/* Decorative Divider */}
          <BaseSkeleton className="w-8 h-[2px] rounded-full" />

          {/* Author */}
          <BaseSkeleton className="w-1/3 h-4 rounded-sm" />

          {/* Meta Info */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <BaseSkeleton className="flex-1 h-6 rounded-md" />
            <BaseSkeleton className="flex-1 h-6 rounded-md" />
            <BaseSkeleton className="flex-1 h-6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
