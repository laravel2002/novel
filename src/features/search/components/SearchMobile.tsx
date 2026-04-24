import StoryListItem from "@/features/story/components/shared/StoryListItem";
import Link from "next/link";
import type { SearchViewProps } from "./SearchDesktop";

export function SearchMobile({
  stories,
  totalCount,
  query,
  page,
}: SearchViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 pb-6 border-b border-[#b0aea5]/10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#d97757] mb-1">
            Kết quả cho
          </p>
          <h1 className="font-serif text-3xl font-bold text-[#faf9f5] leading-tight break-all">
            &quot;{query}&quot;
          </h1>
        </div>
        <div className="inline-flex w-max px-3 py-1.5 rounded-md bg-muted/40 border border-border/50 shadow-sm">
          <span className="text-[#faf9f5]/80 text-[11px] font-bold">
            <span className="text-secondary mr-1">{totalCount}</span>
            kết quả
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stories.map((story, index) => (
          <StoryListItem key={story.id} story={story} index={index} />
        ))}
      </div>

      {totalCount > 20 && (
        <div className="flex justify-center pt-8">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/tim-kiem?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-4 py-2 flex items-center justify-center rounded-lg border border-[#b0aea5]/20 text-[#b0aea5] bg-muted/30 text-xs font-bold active:scale-95 transition-transform"
              >
                Trước
              </Link>
            )}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#faf9f5] font-black text-xs shadow-md">
              {page}
            </div>
            {totalCount > page * 20 && (
              <Link
                href={`/tim-kiem?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-4 py-2 flex items-center justify-center rounded-lg border border-[#b0aea5]/20 text-[#b0aea5] bg-muted/30 text-xs font-bold active:scale-95 transition-transform"
              >
                Sau
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
