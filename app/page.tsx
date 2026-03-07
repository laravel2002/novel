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
  const featuredPromise = getLatestUpdates(1).then((res) => res[0]);

  // Lấy danh sách truyện mới cập nhật và loại bỏ featured
  const latestStoriesPromise = Promise.all([
    featuredPromise,
    getLatestUpdates(13),
  ]).then(([featuredStory, latestStoriesData]) =>
    latestStoriesData.filter((s) => s.id !== featuredStory?.id).slice(0, 12),
  );

  const topViewsPromise = getTopStoriesByViews(10);
  const topRatedPromise = getTopStoriesByRating(10);
  const completedStoriesPromise = getCompletedStories(10);

  return (
    <HomeController
      featuredStoryPromise={featuredPromise}
      latestStoriesPromise={latestStoriesPromise}
      topViewsSidebarPromise={topViewsPromise}
      topRatedPromise={topRatedPromise}
      completedStoriesPromise={completedStoriesPromise}
    />
  );
}
