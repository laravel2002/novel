import StoryListItem from "@/features/story/components/shared/StoryListItem";
import { PodiumItem } from "../shared/PodiumItem";

export interface RankingViewProps {
  mappedStories: any[];
  isFirstPage: boolean;
  page: number;
}

export function RankingDesktop({
  mappedStories,
  isFirstPage,
  page,
}: RankingViewProps) {
  const top3 = isFirstPage ? mappedStories.slice(0, 3) : [];
  const rest = isFirstPage ? mappedStories.slice(3) : mappedStories;

  return (
    <div className="space-y-16">
      {isFirstPage && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 items-end px-4 md:px-0 mt-16 sm:mt-24 pt-8 md:pt-12 mb-16">
          {top3[1] && (
            <PodiumItem story={top3[1]} index={1} variant="desktop" />
          )}
          {top3[0] && (
            <PodiumItem story={top3[0]} index={0} variant="desktop" />
          )}
          {top3[2] && (
            <PodiumItem story={top3[2]} index={2} variant="desktop" />
          )}
        </div>
      )}

      {isFirstPage && top3.length > 0 && rest.length > 0 && (
        <div className="flex items-center justify-center space-x-4 pb-8">
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#b0aea5]/30"></div>
          <span className="text-[#b0aea5]/50 font-serif italic text-sm tracking-widest uppercase">
            Các Vị Trí Còn Lại
          </span>
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#b0aea5]/30"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
        {rest.map((story, index) => {
          const rankNumber = isFirstPage
            ? index + 4
            : index + 1 + (page - 1) * 20;

          return (
            <div key={story.id} className="relative group pt-14">
              <div className="absolute flex items-baseline gap-1 -top-8 left-2 z-20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="text-xl font-bold text-[#d97757]/80">#</span>
                <span className="font-serif italic text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#faf9f5] to-[#b0aea5]/20 drop-shadow-lg w-20">
                  {rankNumber}
                </span>
              </div>
              <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                <StoryListItem story={story as any} index={index} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
