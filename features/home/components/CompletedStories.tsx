import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconCircleCheckFilled, IconChevronRight } from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import {
  FeaturedCompletedSkeleton,
  GridCompletedSkeleton,
} from "@/features/library/components/CompletedStorySkeleton";

interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  rating: number;
  description: string | null;
  totalChapters?: number;
  category?: { name: string };
}

export function CompletedStories({ stories = [] }: { stories?: Story[] }) {
  if (stories.length === 0) return null;

  const featuredCompleted = stories[0];
  const otherStories = stories.slice(1, 9); // Giới hạn 8 truyện cho grid 2x4

  return (
    <section className="relative w-full pt-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-heading font-black text-white tracking-wide flex items-center gap-2">
            Đã Hoàn Thành
            <IconCircleCheckFilled className="w-6 h-6 text-green-500" />
          </h2>
          <div className="hidden sm:block text-white/30 text-xs italic font-serif">
            Những bộ truyện đã khép lại trọn vẹn
          </div>
        </div>

        <Link
          href="/hoan-thanh"
          className="group flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-xs font-bold text-green-500 hover:bg-green-500/10 hover:border-green-500/50 transition-colors uppercase tracking-wider"
        >
          <span>Xem Toàn Bộ</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {stories.length > 0 ? (
          <>
            {/* FEATURED CARD */}
            <div className="lg:col-span-5 relative group">
              <Link
                href={`/truyen/${featuredCompleted.slug || featuredCompleted.id}`}
                className="block w-full h-full relative z-10 rounded-3xl overflow-hidden border border-green-500/10 bg-[#0a100d] hover:bg-[#0c1410] hover:border-green-500/20 transition-all duration-500 p-6 flex flex-col"
              >
                {/* Content... */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <span className="backdrop-blur-md bg-green-500/20 text-green-500 rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Mới Hoàn Thành
                  </span>
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">
                    {featuredCompleted.category?.name || "Kỳ Ảo"}
                  </span>
                </div>
                <div className="relative aspect-[3/4] w-[180px] shrink-0 mx-auto rounded-xl overflow-hidden shadow-lg border border-white/5 mb-8">
                  <Image
                    src={getImageUrl(featuredCompleted.coverUrl)}
                    alt={featuredCompleted.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="180px"
                  />
                </div>
                <div className="mt-auto px-2">
                  <h3 className="font-heading text-2xl font-black leading-tight text-white mb-3 group-hover:text-green-500 transition-colors line-clamp-2">
                    {featuredCompleted.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/50 uppercase tracking-widest">
                      <span className="text-green-500/50">🖊</span>
                      {featuredCompleted.author || "Đang cập nhật"}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/50 uppercase tracking-widest">
                      {featuredCompleted.totalChapters || 0} chương
                    </div>
                  </div>
                  <p className="text-white/40 text-sm line-clamp-2 leading-relaxed mb-6 font-medium">
                    {featuredCompleted.description ||
                      "Cuộc hành trình vĩ đại đã chính thức khép lại. Khám phá toàn bộ diễn biến của siêu phẩm này ngay hôm nay."}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-green-500 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      Đọc Trọn Bộ <IconChevronRight className="w-4 h-4" />
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-green-500/20 bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <IconCircleCheckFilled className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* GRID CARDS */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
              {otherStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/truyen/${story.slug || story.id}`}
                  className="group flex gap-4 p-3 bg-[#111113] hover:bg-[#15151a] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="relative w-[72px] h-[100px] shrink-0 rounded-md overflow-hidden bg-zinc-900 border border-white/5">
                    <Image
                      src={getImageUrl(story.coverUrl)}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                      sizes="72px"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                          Hoàn Thành
                        </span>
                        {story.category && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                            {story.category.name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-[15px] leading-snug text-white/90 group-hover:text-green-500 transition-colors line-clamp-2">
                        {story.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                      <span className="text-[11px] font-medium text-white/40 truncate pr-2">
                        {story.author || "Đang cập nhật"}
                      </span>
                      <span className="flex items-center text-[10px] text-green-500 font-bold uppercase shrink-0">
                        Đọc <IconChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-5">
              <FeaturedCompletedSkeleton />
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
              {Array.from({ length: 8 }).map((_, idx) => (
                <GridCompletedSkeleton key={idx} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
