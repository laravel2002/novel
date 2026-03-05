import { Metadata } from "next";
import { getStoriesPaginated } from "@/services/discovery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { getImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mới Cập Nhật | Novel",
  description: "Danh sách 100 truyện chữ mới được cập nhật chương mới nhất.",
};

export const revalidate = 600;

interface StoryCardProps {
  id: number;
  slug: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  author: string | null;
  category?: { name: string } | null;
}

// Reusable Poster Card strictly styled for the List Page (Editorial Luxury)
function GridStoryCard({
  story,
  index,
}: {
  story: StoryCardProps;
  index: number;
}) {
  const isHot = index < 3; // Top 3 gets special flame badge

  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group relative block h-[400px] sm:h-[450px] w-full outline-hidden isolate rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-700 hover:-translate-y-2 ring-1 ring-white/10 hover:ring-primary/40"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Image
        src={getImageUrl(story.coverUrl)}
        alt={`Bìa truyện ${story.title}`}
        fill
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/10 opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100" />

      {isHot && (
        <div className="absolute top-0 right-0 p-5 flex flex-col items-end z-20 pointer-events-none">
          <div className="transform rotate-[3deg] transition-transform duration-500 group-hover:rotate-0">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-[10px] tracking-widest px-3 py-1.5 uppercase shadow-lg ring-1 ring-white/20 slanted-edge flex items-center gap-1">
              <IconFlame className="w-3.5 h-3.5" /> HOT
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-7 flex flex-col justify-end z-20 h-[80%]">
        <div className="relative mt-auto">
          {story.category && (
            <span className="mb-3 inline-block backdrop-blur-md bg-white/10 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/90 ring-1 ring-white/20 shadow-sm transition-colors group-hover:bg-primary group-hover:ring-primary/50 group-hover:text-white">
              {story.category.name}
            </span>
          )}

          <div className="overflow-hidden w-full mb-3 @container mask-edges">
            <h3 className="font-heading text-xl sm:text-2xl font-black leading-tight tracking-tight drop-shadow-md text-white transition-all duration-300 group-hover:text-primary-foreground min-h-[2.4em] flex items-center">
              <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent group-hover:from-white group-hover:to-orange-200 inline-block min-w-full w-max whitespace-nowrap will-change-transform hover-marquee-trigger pr-4 shrink-0">
                {story.title}
              </span>
            </h3>
          </div>

          <p className="font-serif text-[13px] line-clamp-2 leading-relaxed text-white/60 mb-5 transition-all duration-300 group-hover:text-white/80">
            {story.description ||
              "Hành trình vĩ đại đang chờ đón bạn khám phá... Hãy lật mở ngay trang tiếp theo của cuốn tiểu thuyết này."}
          </p>

          <div className="flex items-center justify-between border-t border-white/15 pt-4 gap-3">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm shadow-inner ring-1 ring-white/20 transition-all duration-300 group-hover:bg-primary group-hover:ring-primary">
                <span className="text-[10px]">✍</span>
              </div>
              <span className="font-sans text-[13px] font-semibold text-white/80 truncate">
                {story.author || "Đang cập nhật"}
              </span>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1.5 text-white/50 group-hover:text-primary transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest inline-block">
                Đọc
              </span>
              <IconArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function LatestUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const parsedCursor = cursor ? parseInt(cursor, 10) : undefined;

  const { data: stories, nextCursor } = await getStoriesPaginated({
    limit: 12,
    cursor: parsedCursor,
    sortBy: "updatedAt",
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-40 -left-20 w-[40rem] h-[40rem] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 w-[60rem] h-[30rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl relative z-10">
        {/* Cinematic Header */}
        <div className="mb-16 lg:mb-24 flex flex-col items-center justify-center text-center relative isolate">
          <BadgeDecorative />
          <h1 className="font-heading text-5xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter text-foreground leading-[0.9] uppercase drop-shadow-sm mb-6">
            Mới <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary/80">
              Cập Nhật
            </span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl font-serif italic max-w-2xl px-4 border-l-4 border-r-4 border-primary/20 py-2">
            Tuyệt phẩm bùng nổ hôm nay. Nơi hội tụ những chương truyện nóng hổi
            vừa ra lò từ các tác giả đình đám.
          </p>
        </div>

        {/* Story Grid Container */}
        {stories.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground bg-secondary/10 rounded-[2.5rem] border border-border/50 backdrop-blur-sm">
            <h3 className="font-heading text-2xl font-bold mb-2">
              Hệ thống trống
            </h3>
            <p>Xin lỗi, hiện chưa có truyện cập nhật. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {stories.map((story, i) => (
              <GridStoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}

        {/* Elegant Pagination */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-20 pt-10 border-t-2 border-primary/20 gap-4">
          <Button
            variant="outline"
            disabled={!cursor}
            asChild={!!cursor}
            className="w-full sm:w-auto h-14 rounded-full px-8 text-sm font-black tracking-widest uppercase bg-transparent border-primary/30 hover:bg-primary hover:text-white transition-all duration-300"
          >
            {cursor ? (
              <Link href="/moi-cap-nhat">
                <IconChevronLeft className="w-5 h-5 mr-3 opacity-70" /> Về Mới
                Nhất
              </Link>
            ) : (
              <span className="opacity-50">
                <IconChevronLeft className="w-5 h-5 mr-3" /> Trang Đầu
              </span>
            )}
          </Button>

          {nextCursor ? (
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto h-14 rounded-full px-8 text-sm font-black tracking-widest uppercase bg-transparent border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 group"
            >
              <Link href={`/moi-cap-nhat?cursor=${nextCursor}`}>
                Trang Tiếp Theo{" "}
                <IconChevronRight className="w-5 h-5 ml-3 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full sm:w-auto h-14 rounded-full px-8 text-sm font-black tracking-widest uppercase bg-transparent border-border/50 opacity-50"
            >
              Trang Cuối <IconChevronRight className="w-5 h-5 ml-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeDecorative() {
  return (
    <div className="mb-6 flex transform items-center justify-center">
      <span className="bg-primary/10 text-primary font-black text-xs tracking-[0.2em] px-5 py-2 uppercase shadow-sm ring-1 ring-primary/20 rounded-full flex items-center gap-2 backdrop-blur-md">
        <IconFlame className="w-4 h-4 fill-primary pb-px" /> TIN NÓNG LIÊN TỤC
      </span>
    </div>
  );
}
