import Image from "next/image";
import Link from "next/link";
import {
  IconFlame,
  IconArrowUpRight,
  IconEye,
  IconLayersLinked,
} from "@tabler/icons-react";
import { getImageUrl } from "@/lib/utils";
import StoryCardSkeleton from "@/features/ranking/components/StoryCardSkeleton";

// Type definition for the story prop
interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  status: string;
  updatedAt: Date;
  description: string | null;
  category?: {
    name: string;
    slug: string;
  };
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const isNew = true; // Placeholder cho mạch logic check mới

  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group relative flex items-stretch gap-4 rounded-xl border border-white/5 bg-[#0f0f12]/80 p-3 hover:bg-[#15151a] hover:border-white/10 transition-all duration-300 min-h-[140px]"
    >
      {/* Thumbnail Left */}
      <div className="relative w-[90px] min-w-[90px] shrink-0 overflow-hidden rounded-md bg-zinc-900 shadow-md">
        <Image
          src={getImageUrl(story.coverUrl)}
          alt={`Bìa truyện ${story.title}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="90px"
        />
        {/* Lớp overlay nhẹ trên ảnh để tạo sự mượt mà */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />

        {isNew && (
          <div className="absolute top-1 left-1 bg-orange-600 px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
            Mới
          </div>
        )}
      </div>

      {/* Content Right */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
        <div className="space-y-1">
          {/* Badge & Category */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] uppercase font-bold text-white/70">
              {story.category?.name || "Kỳ ảo"}
            </span>
            <span className="text-orange-500 text-xs font-medium">
              Truyện hot
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading text-base font-bold leading-tight text-white/95 truncate group-hover:text-primary transition-colors">
            {story.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
            {story.description ||
              "Cuộc hành trình vĩ đại đang chờ đón độc giả khám phá... Lật mở từng trang sách để tận hưởng thế giới kỳ ảo này và bước vào những chân trời không tưởng."}
          </p>
        </div>

        {/* Footer info: Author & Stats/Action */}
        <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
          <div className="flex items-center gap-1.5 truncate pr-2 text-white/50 text-xs">
            <span className="text-white/30">🖊</span>
            <span className="truncate">{story.author || "Đang cập nhật"}</span>
          </div>

          {/* Đọc button (hover effect) */}
          <div className="flex shrink-0 items-center justify-center gap-1 text-white/30 group-hover:text-primary transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">
              Đọc
            </span>
            <IconArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LatestUpdates({ stories = [] }: { stories?: Story[] }) {
  const displayStories = stories.length > 0 ? stories : [];

  return (
    <section className="relative w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end relative">
        <div className="relative">
          {/* Decorative Glow */}
          <div className="absolute -left-10 -top-10 -z-10 h-32 w-32 rounded-full bg-primary/20 blur-[50px] mix-blend-screen" />

          <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter text-white">
            Mới{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
              Cập Nhật
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-white/50 italic flex items-center gap-2">
            <span className="w-5 h-[2px] bg-orange-500/50 rounded-full inline-block"></span>
            Tuyệt phẩm bùng nổ hôm nay
          </p>
        </div>

        <Link
          href="/moi-cap-nhat"
          className="group flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-wider"
        >
          <span>Khám Phá Tất Cả</span>
          <IconArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-orange-500" />
        </Link>
        <div className="absolute -bottom-[1px] left-0 w-24 h-[1px] bg-gradient-to-r from-orange-500 to-transparent" />
      </div>

      {/* Grid: 1 col on mobile, 2 cols and 6 rows on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayStories.length > 0
          ? displayStories
              .slice(0, 12)
              .map((story, idx) => (
                <StoryCard key={story.id} story={story} index={idx} />
              ))
          : Array.from({ length: 12 }).map((_, idx) => (
              <StoryCardSkeleton key={idx} />
            ))}
      </div>

      {/* See more button bottom */}
      <div className="mt-6 flex justify-center">
        <Link
          href="/moi-cap-nhat"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
        >
          Xem thêm <IconArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
