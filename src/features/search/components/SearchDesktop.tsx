import StoryListItem from "@/features/story/components/shared/StoryListItem";
import Link from "next/link";

export interface SearchViewProps {
  stories: any[];
  totalCount: number;
  query: string;
  page: number;
}

export function SearchDesktop({
  stories,
  totalCount,
  query,
  page,
}: SearchViewProps) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-[#b0aea5]/10">
        <div>
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[#d97757] mb-2 drop-shadow-sm">
            Kết quả tìm kiếm cho
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf9f5] leading-tight">
            &quot;{query}&quot;
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#141413] border border-[#b0aea5]/20 backdrop-blur-md shadow-sm">
            <span className="text-[#faf9f5]/90 text-sm font-bold">
              <span className="text-[#d97757]">{totalCount}</span> truyện được
              tìm thấy
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
        {stories.map((story, index) => (
          <StoryListItem key={story.id} story={story} index={index} />
        ))}
      </div>

      {totalCount > 20 && (
        <div className="flex justify-center pt-12">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/tim-kiem?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-6 py-2.5 rounded-full border border-[#b0aea5]/20 hover:border-[#d97757]/50 text-[#b0aea5] hover:text-[#faf9f5] transition-all duration-300 text-sm font-bold"
              >
                Trước
              </Link>
            )}
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-[#faf9f5] font-black text-sm shadow-lg shadow-primary/20">
              {page}
            </div>
            {totalCount > page * 20 && (
              <Link
                href={`/tim-kiem?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-6 py-2.5 rounded-full border border-[#b0aea5]/20 hover:border-[#d97757]/50 text-[#b0aea5] hover:text-[#faf9f5] transition-all duration-300 text-sm font-bold"
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
