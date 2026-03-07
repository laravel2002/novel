import { Suspense } from "react";
import { Await } from "@/components/shared/Await";
import { LatestUpdates } from "./LatestUpdates";
import { SidebarRankings } from "./SidebarRankings";
import { ThreeColRankings } from "./ThreeColRankings";
import { CompletedStories } from "./CompletedStories";
import { HeroBanner } from "./HeroBanner";
import type { HomeViewProps } from "./Home";
import {
  HeroBannerSkeleton,
  LatestUpdatesSkeleton,
  SidebarRankingsSkeleton,
  ThreeColRankingsSkeleton,
  CompletedStoriesSkeleton,
} from "./HomeSkeletons";

export function HomeMobile({
  featuredStoryPromise,
  latestStoriesPromise,
  topViewsSidebarPromise,
  topRatedPromise,
  completedStoriesPromise,
}: HomeViewProps) {
  return (
    <div className="bg-[#030303] min-h-screen w-full relative">
      <main className="w-full px-6 py-16 space-y-6">
        <section>
          <Suspense fallback={<HeroBannerSkeleton />}>
            <Await promise={featuredStoryPromise}>
              {(featuredStory) => <HeroBanner featuredStory={featuredStory} />}
            </Await>
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<LatestUpdatesSkeleton />}>
            <Await promise={latestStoriesPromise}>
              {(latestStories) => <LatestUpdates stories={latestStories} />}
            </Await>
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<SidebarRankingsSkeleton />}>
            <Await
              promise={Promise.all([topViewsSidebarPromise, topRatedPromise])}
            >
              {([topViews, topRated]) => (
                <SidebarRankings topViews={topViews} hotStories={topRated} />
              )}
            </Await>
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<ThreeColRankingsSkeleton />}>
            <Await
              promise={Promise.all([topRatedPromise, topViewsSidebarPromise])}
            >
              {([topRated, topViews]) => (
                <ThreeColRankings
                  nominations={topRated}
                  topViews={topViews}
                  favorites={topRated}
                />
              )}
            </Await>
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<CompletedStoriesSkeleton />}>
            <Await promise={completedStoriesPromise}>
              {(completedStories) => (
                <CompletedStories stories={completedStories} />
              )}
            </Await>
          </Suspense>
        </section>
      </main>
    </div>
  );
}
