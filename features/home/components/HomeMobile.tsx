import { LatestUpdates } from "./LatestUpdates";
import { SidebarRankings } from "./SidebarRankings";
import { ThreeColRankings } from "./ThreeColRankings";
import { CompletedStories } from "./CompletedStories";
import { HeroBanner } from "./HeroBanner";
import type { HomeViewProps } from "./HomeDesktop";

export function HomeMobile({
  featuredStory,
  latestStories,
  topViewsSidebar,
  topRated,
  completedStories,
}: HomeViewProps) {
  return (
    <div className="bg-[#030303] min-h-screen w-full relative">
      <main className="w-full px-4 py-6 space-y-12 pb-24">
        {/* Hero Section Tối Giản */}
        <section>
          <HeroBanner featuredStory={featuredStory} />
        </section>

        <section>
          <LatestUpdates stories={latestStories} />
        </section>

        <section>
          <SidebarRankings topViews={topViewsSidebar} hotStories={topRated} />
        </section>

        <section>
          <ThreeColRankings
            nominations={topRated}
            topViews={topViewsSidebar}
            favorites={topRated}
          />
        </section>

        <section>
          <CompletedStories stories={completedStories} />
        </section>
      </main>
    </div>
  );
}
