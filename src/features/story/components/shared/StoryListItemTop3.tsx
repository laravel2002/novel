import Link from "next/link";
import Image from "next/image";
import { Status } from "@/generated/prisma/client";
import { Eye, BookOpen, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getImageUrl } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  status: Status;
  updatedAt: Date;
  views: number;
  rating: number;
  description: string | null;
  totalChapters: number;
  categories: Category[];
}

interface StoryListItemProps {
  story: Story;
  index?: number;
}

export default function StoryListItemTop3({
  story,
  index = 0,
}: StoryListItemProps) {
  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group relative flex flex-col h-[480px] sm:h-[500px] w-full bg-[#141413] border-[1.5px] border-[#d97757]/30 rounded-[1.5rem] overflow-hidden shadow-xl shadow-[#d97757]/10 hover:shadow-2xl hover:shadow-[#d97757]/30 transition-all duration-700 hover:-translate-y-2 isolate"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Full Bleed Background Image */}
      <Image
        src={getImageUrl(story.coverUrl)}
        alt={`Bìa truyện ${story.title}`}
        fill
        className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 opacity-75 group-hover:opacity-100"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* Gradient Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/60 to-transparent opacity-95 transition-opacity duration-700 group-hover:opacity-100 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#d97757]/20 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100 z-0" />

      {/* Floating Badges inside Image Area */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-2 mt-6">
          {story.status === "COMPLETED" && (
            <span className="bg-[#788c5d] text-[#faf9f5] border border-[#788c5d]/50 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit shadow-md">
              Hoàn Thành
            </span>
          )}
          {story.categories && story.categories.length > 0 && (
            <span className="backdrop-blur-md bg-[#141413]/70 text-[#faf9f5] border border-[#d97757]/50 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit shadow-md transition-colors group-hover:border-[#d97757] group-hover:text-[#d97757]">
              {story.categories[0].name}
            </span>
          )}
        </div>

        {/* Rating Circle */}
        <div className="flex flex-col items-center justify-center w-9 h-9 mt-6 rounded-full backdrop-blur-md bg-[#141413]/80 border border-[#d97757]/50 shadow-lg shadow-[#d97757]/20 group-hover:bg-[#d97757] transition-colors duration-500">
          <span className="text-[#faf9f5] text-[11px] font-black leading-none">
            {(story.rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="flex flex-col justify-end flex-1 p-6 z-10 relative">
        <div className="mt-auto">
          <h3 className="font-serif text-[22px] sm:text-[26px] font-bold leading-[1.2] drop-shadow-lg text-[#faf9f5] transition-colors duration-500 group-hover:text-[#d97757] line-clamp-2 min-h-[2.4em] mb-2">
            {story.title}
          </h3>

          {/* Decorative divider - animates on hover */}
          <div className="w-12 h-[3px] bg-[#d97757] my-4 transition-all duration-700 ease-out group-hover:w-full opacity-90 shadow-[0_0_10px_rgba(217,119,87,0.5)]" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[12px] font-bold text-[#faf9f5]/90 truncate pr-2 tracking-widest uppercase shadow-sm flex items-center gap-1.5">
                <span className="text-[12px] text-[#d97757]">✍</span>
                {story.author || "Vô Danh"}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-[12px] font-medium text-[#b0aea5]">
              <span
                className="flex items-center gap-1.5 hover:text-[#faf9f5] transition-colors backdrop-blur-md bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5"
                title="Lượt xem"
              >
                <Eye className="w-4 h-4 text-[#d97757]" />
                {Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                  story.views,
                )}
              </span>
              <span
                className="flex items-center gap-1.5 hover:text-[#faf9f5] transition-colors backdrop-blur-md bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5"
                title="Số chương"
              >
                <BookOpen className="w-4 h-4 text-[#6a9bcc]" />
                {story.totalChapters}
              </span>
              <span
                className="flex items-center gap-1.5 text-right hover:text-[#faf9f5] transition-colors backdrop-blur-md bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5"
                title="Cập nhật"
              >
                <Clock className="w-4 h-4 text-[#788c5d]" />
                <span className="truncate max-w-[60px]">
                  {story.updatedAt &&
                  !isNaN(new Date(story.updatedAt).getTime())
                    ? formatDistanceToNow(new Date(story.updatedAt), {
                        locale: vi,
                      })
                    : "Vừa xong"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
