import { Suspense } from "react";
import { Metadata } from "next";
import { getStoriesPaginated, getAllCategories } from "@/services/discovery";
import { Status } from "@/generated/prisma/client";
import { CompletedFilters } from "@/features/library/components/CompletedFilters";
import { CompletedStoriesClient } from "./CompletedStoriesClient";
import { CheckCircle2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Truyện Đã Hoàn Thành (Full) | AntiGravity",
  description:
    "Danh sách truyện chữ đã hoàn thành (full) được cập nhật liên tục với giao diện cao cấp.",
};

// 1 Hour ISR
export const revalidate = 3600;

export default async function CompletedPage() {
  const categories = await getAllCategories();

  // Load default data for static generation
  const initialData = await getStoriesPaginated({
    status: Status.COMPLETED,
    limit: 20,
    sortBy: "updatedAt",
  });

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
          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted rounded-xl" />}>
            <CompletedStoriesClient initialData={initialData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
