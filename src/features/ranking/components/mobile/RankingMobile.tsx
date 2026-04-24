import StoryListItem from "@/features/story/components/shared/StoryListItem";
import { PodiumItem } from "../shared/PodiumItem";
import type { RankingViewProps } from "../desktop/RankingDesktop";

export function RankingMobile({
  mappedStories,
  isFirstPage,
  page,
}: RankingViewProps) {
  const top3 = isFirstPage ? mappedStories.slice(0, 3) : [];
  const rest = isFirstPage ? mappedStories.slice(3) : mappedStories;

  return (
    <div className="space-y-12 px-2">
      {/* Mobile Podium - Stacked vertically */}
      {isFirstPage && top3.length > 0 && (
        <div className="flex flex-col gap-10 mt-12 mb-12">
          {top3.map((story, index) => (
            <PodiumItem
              key={story.id}
              story={story}
              index={index}
              variant="mobile"
            />
          ))}
        </div>
      )}

      {isFirstPage && top3.length > 0 && rest.length > 0 && (
        <div className="flex items-center justify-center space-x-2 pb-4">
          <div className="h-[1px] w-12 bg-[#b0aea5]/30"></div>
          <span className="text-[#b0aea5]/70 text-xs tracking-widest uppercase text-center border px-2 py-1 rounded-full border-[#b0aea5]/10">
            Các Vị Trí Cùng Bảng
          </span>
          <div className="h-[1px] w-12 bg-[#b0aea5]/30"></div>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {rest.map((story, index) => {
          const rankNumber = isFirstPage
            ? index + 4
            : index + 1 + (page - 1) * 20;

          return (
            <div key={story.id} className="relative pt-6">
              <div className="absolute flex items-baseline gap-1 -top-4 left-0 z-20">
                <span className="text-sm font-bold text-[#d97757]">#</span>
                <span className="font-serif italic text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#faf9f5] to-[#b0aea5]/30 drop-shadow-md">
                  {rankNumber}
                </span>
              </div>
              <StoryListItem story={story as any} index={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
