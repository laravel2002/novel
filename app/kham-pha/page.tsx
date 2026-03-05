import { Metadata } from "next";
import { ExploreMobileUI } from "@/features/explore/components/mobile/ExploreMobileUI";
import { Suspense } from "react";
import SearchSkeleton from "@/components/skeletons/SearchSkeleton";
import { getTrendingStories } from "@/features/story/services/story";

export const metadata: Metadata = {
  title: "Khám Phá | Novel",
  description: "Tìm kiếm và khám phá thế giới truyện phong phú.",
};

export default async function ExplorePage() {
  // Lấy dữ liệu truyện đang hot (Trending)
  const trendingStories = await getTrendingStories(10);

  return (
    <div className="min-h-screen bg-background pb-20 md:hidden">
      <Suspense fallback={<SearchSkeleton />}>
        <ExploreMobileUI trendingStories={trendingStories} />
      </Suspense>
    </div>
  );
}
