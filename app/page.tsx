import { Home as HomeController } from "@/features/home/components/Home";
import {
  getLatestUpdates,
  getTopStoriesByViews,
  getTopStoriesByRating,
  getCompletedStories,
} from "@/features/story/services/story";

// Bật tính năng Incremental Static Regeneration (ISR) với thời gian làm mới cache là 5 phút
export const revalidate = 300;

export default async function Home() {
  // Lấy dữ liệu 1 Truyện mới nhất làm Featured cho Hero Banner
  const featuredPromise = getLatestUpdates(1).then((res) => res[0]);

  // Lấy danh sách truyện mới cập nhật (trừ truyện đã lấy làm featured)
  const latestStoriesPromise = getLatestUpdates(13); // lấy 13 rồi bỏ 1
  const topViewsPromise = getTopStoriesByViews(10);
  const topRatedPromise = getTopStoriesByRating(10);
  const completedStoriesPromise = getCompletedStories(10);

  const [
    featuredStory,
    latestStoriesData,
    topViewsSidebar,
    topRated,
    completedStories,
  ] = await Promise.all([
    featuredPromise,
    latestStoriesPromise,
    topViewsPromise,
    topRatedPromise,
    completedStoriesPromise,
  ]);

  // Loại bỏ featured khỏi list mới cập nhật
  const latestStories = latestStoriesData
    .filter((s) => s.id !== featuredStory?.id)
    .slice(0, 12);

  return (
    <HomeController
      featuredStory={featuredStory}
      latestStories={latestStories}
      topViewsSidebar={topViewsSidebar}
      topRated={topRated}
      completedStories={completedStories}
    />
  );
}
