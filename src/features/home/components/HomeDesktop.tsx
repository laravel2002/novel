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

export function HomeDesktop({
  featuredStoryPromise,
  latestStoriesPromise,
  topViewsSidebarPromise,
  topRatedPromise,
  completedStoriesPromise,
}: HomeViewProps) {
  return (
    <div className="bg-[#030303] min-h-screen w-full relative">
      <main className="container max-w-7xl mx-auto px-4 py-16 md:py-24 space-y-20 md:space-y-28">
        <section>
          <Suspense fallback={<HeroBannerSkeleton />}>
            <Await promise={featuredStoryPromise}>
              {(featuredStory) => <HeroBanner featuredStory={featuredStory} />}
            </Await>
          </Suspense>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14">
          <div className="xl:col-span-8">
            <Suspense fallback={<LatestUpdatesSkeleton />}>
              <Await promise={latestStoriesPromise}>
                {(latestStories) => <LatestUpdates stories={latestStories} />}
              </Await>
            </Suspense>
          </div>

          <div className="xl:col-span-4">
            <SidebarRankingsWrapper
              fallbackWrapper={true}
              topViewsSidebarPromise={topViewsSidebarPromise}
              topRatedPromise={topRatedPromise}
            />
          </div>
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

        <section className="pb-20">
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

// Helper wrapper cho SidebarRankings do nó nhận 2 promises
function SidebarRankingsWrapper({ fallbackWrapper, ...props }: any) {
  if (fallbackWrapper) {
    return (
      <Suspense fallback={<SidebarRankingsSkeleton />}>
        <Await
          promise={Promise.all([
            props.topViewsSidebarPromise,
            props.topRatedPromise,
          ])}
        >
          {([topViews, topRated]) => (
            <SidebarRankings topViews={topViews} hotStories={topRated} />
          )}
        </Await>
      </Suspense>
    );
  }
  return (
    <aside className="w-full flex flex-col gap-10 sticky top-24 pt-2">
      <div className="animate-pulse bg-white/5 h-64 rounded-2xl" />
      <div className="animate-pulse bg-white/5 h-64 rounded-2xl" />
    </aside>
  );
}
