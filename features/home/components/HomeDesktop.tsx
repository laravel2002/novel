import { LatestUpdates } from "./LatestUpdates";
import { SidebarRankings } from "./SidebarRankings";
import { ThreeColRankings } from "./ThreeColRankings";
import { CompletedStories } from "./CompletedStories";
import { HeroBanner } from "./HeroBanner";

export interface HomeViewProps {
  featuredStory: any;
  latestStories: any[];
  topViewsSidebar: any[];
  topRated: any[];
  completedStories: any[];
}

export function HomeDesktop({
  featuredStory,
  latestStories,
  topViewsSidebar,
  topRated,
  completedStories,
}: HomeViewProps) {
  return (
    <div className="bg-[#030303] min-h-screen w-full relative">
      <main className="container max-w-7xl mx-auto px-4 py-16 md:py-24 space-y-20 md:space-y-28">
        <section>
          <HeroBanner featuredStory={featuredStory} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14">
          <div className="xl:col-span-8">
            <LatestUpdates stories={latestStories} />
          </div>

          <div className="xl:col-span-4">
            <SidebarRankings topViews={topViewsSidebar} hotStories={topRated} />
          </div>
        </section>

        <section>
          <ThreeColRankings
            nominations={topRated}
            topViews={topViewsSidebar}
            favorites={topRated}
          />
        </section>

        <section className="pb-20">
          <CompletedStories stories={completedStories} />
        </section>
      </main>
    </div>
  );
}
