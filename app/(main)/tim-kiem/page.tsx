import { Suspense } from "react";
import { searchStories } from "@/features/story/services/story";
import { SearchListUI } from "@/features/search/components/Search";
import { IconSearch, IconTelescope, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import Loading from "./loading";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  const { stories, totalCount } = await searchStories(query, page, 20);

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-inner">
          <IconTelescope className="w-12 h-12 text-primary/40" />
        </div>
        <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-[#faf9f5] to-[#b0aea5] bg-clip-text text-transparent mb-4">
          Không tìm thấy kết quả
        </h2>
        <p className="text-[#b0aea5] max-w-md mx-auto mb-10 leading-relaxed font-sans font-medium">
          Rất tiếc, chúng tôi không tìm thấy truyện nào khớp với &quot;
          <span className="text-[#d97757]">{query}</span>&quot;. Hãy thử tìm
          kiếm với từ khóa khác hoặc tên tác giả.
        </p>
        <Link
          href="/"
          className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 text-sm uppercase tracking-widest"
        >
          Trở về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <SearchListUI
      stories={stories}
      totalCount={totalCount}
      query={query}
      page={page}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = q || "";
  const currentPage = Number(page) || 1;

  return (
    <main className="min-h-screen bg-[#141413] selection:bg-[#d97757]/30">
      {/* Decorative gradient */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#d97757]/10 to-transparent pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-24 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#b0aea5] hover:text-[#d97757] transition-colors mb-12 group"
        >
          <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Trang chủ
        </Link>

        {query ? (
          <Suspense fallback={<Loading />}>
            <SearchResults query={query} page={currentPage} />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
              <IconSearch className="w-10 h-10 text-primary/40" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#faf9f5] mb-4">
              Bạn đang tìm kiếm gì?
            </h1>
            <p className="text-[#b0aea5] font-medium max-w-md mx-auto">
              Nhập tên truyện hoặc tác giả vào thanh tìm kiếm phía trên để bắt
              đầu khám phá.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
