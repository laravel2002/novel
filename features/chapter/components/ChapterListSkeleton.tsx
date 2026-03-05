"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * ChapterListSkeleton - Skeleton cho danh sách chương
 * Hiển thị grid các ô chương giả lập.
 */
export default function ChapterListSkeleton() {
  // Tạo mảng giả lập 12 chương (số lượng trung bình hiển thị)
  const items = Array.from({ length: 12 });

  return (
    <Card className="border-none shadow-sm bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BaseSkeleton className="w-5 h-5 rounded-sm" />
          <BaseSkeleton className="w-48 h-6 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Lưới hiển thị chương */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="h-10 rounded-md border border-white/5 bg-white/5 px-3 flex items-center gap-2"
            >
              <BaseSkeleton className="w-16 h-4 rounded-sm" />
              <BaseSkeleton className="flex-1 h-4 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Phân trang giả lập */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <BaseSkeleton className="w-20 h-9 rounded-md" />
          <div className="flex gap-1">
            <BaseSkeleton className="w-9 h-9 rounded-md" />
            <BaseSkeleton className="w-9 h-9 rounded-md" />
            <BaseSkeleton className="w-9 h-9 rounded-md" />
          </div>
          <BaseSkeleton className="w-20 h-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
