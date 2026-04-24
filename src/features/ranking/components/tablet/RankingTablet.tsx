import StoryListItem from "@/features/story/components/shared/StoryListItem";
import { PodiumItem } from "../shared/PodiumItem";
import type { RankingViewProps } from "../desktop/RankingDesktop";

export function RankingTablet({
  mappedStories,
  isFirstPage,
  page,
}: RankingViewProps) {
  const top3 = isFirstPage ? mappedStories.slice(0, 3) : [];
  const rest = isFirstPage ? mappedStories.slice(3) : mappedStories;

  return (
    <div className="space-y-16 mt-8">
      {isFirstPage && top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end px-4 mb-20">
          {top3[1] && <PodiumItem story={top3[1]} index={1} variant="tablet" />}
          {top3[0] && <PodiumItem story={top3[0]} index={0} variant="tablet" />}
          {top3[2] && <PodiumItem story={top3[2]} index={2} variant="tablet" />}
        </div>
      )}

      {isFirstPage && top3.length > 0 && rest.length > 0 && (
        <div className="flex items-center justify-center space-x-4 pb-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#b0aea5]/30"></div>
          <span className="text-[#b0aea5]/50 font-serif italic text-xs tracking-widest uppercase">
            Các Vị Trí Còn Lại
          </span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#b0aea5]/30"></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 gap-y-10">
        {rest.map((story, index) => {
          const rankNumber = isFirstPage
            ? index + 4
            : index + 1 + (page - 1) * 20;

          return (
            <div key={story.id} className="relative group pt-10">
              <div className="absolute flex items-baseline gap-1 -top-6 left-2 z-20 pointer-events-none opacity-80">
                <span className="text-lg font-bold text-[#d97757]/80">#</span>
                <span className="font-serif italic text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#faf9f5] to-[#b0aea5]/20 drop-shadow-md">
                  {rankNumber}
                </span>
              </div>
              <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                <StoryListItem story={story as any} index={index} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
