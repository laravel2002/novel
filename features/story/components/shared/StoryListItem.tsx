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

export default function StoryListItem({
  story,
  index = 0,
}: StoryListItemProps) {
  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group relative flex flex-col h-[400px] sm:h-[430px] w-full bg-[#141413] border border-[#b0aea5]/15 rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#d97757]/20 transition-all duration-700 hover:-translate-y-1.5 isolate"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Full Bleed Background Image */}
      <Image
        src={getImageUrl(story.coverUrl)}
        alt={`Bìa truyện ${story.title}`}
        fill
        className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 opacity-70 group-hover:opacity-90"
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/70 to-[#141413]/10 opacity-90 transition-opacity duration-700 group-hover:opacity-100 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#d97757]/20 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100 z-0" />

      {/* Floating Badges inside Image Area */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {story.status === "COMPLETED" && (
            <span className="bg-[#788c5d] text-[#faf9f5] border border-[#788c5d]/50 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit shadow-md">
              Hoàn Thành
            </span>
          )}
          {story.categories && story.categories.length > 0 && (
            <span className="backdrop-blur-md bg-[#141413]/70 text-[#faf9f5] border border-[#b0aea5]/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit shadow-md transition-colors group-hover:border-[#d97757]/60 group-hover:text-[#d97757]">
              {story.categories[0].name}
            </span>
          )}
        </div>

        {/* Rating Circle */}
        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-[#141413]/80 border border-[#d97757]/50 shadow-lg shadow-[#d97757]/20 group-hover:bg-[#d97757] transition-colors duration-500">
          <span className="text-[#faf9f5] text-[10px] font-black leading-none">
            {(story.rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="flex flex-col justify-end flex-1 p-5 z-10 relative">
        <div className="mt-auto">
          <h3 className="font-serif text-[18px] sm:text-[20px] font-bold leading-[1.3] drop-shadow-md text-[#faf9f5] transition-colors duration-500 group-hover:text-[#d97757] line-clamp-2 min-h-[2.6em] mb-1">
            {story.title}
          </h3>

          {/* Decorative divider - animates on hover */}
          <div className="w-8 h-[2px] bg-[#d97757] my-3 sm:my-4 transition-all duration-700 ease-out group-hover:w-full opacity-80" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-semibold text-[#faf9f5]/80 truncate pr-2 tracking-widest uppercase shadow-sm">
                <span className="text-[10px] text-[#d97757] mr-1">✍</span>{" "}
                {story.author || "Vô Danh"}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-[11px] font-medium text-[#b0aea5]">
              <span
                className="flex items-center gap-1.5 hover:text-[#faf9f5] transition-colors backdrop-blur-sm bg-black/20 px-2 py-1 rounded-md"
                title="Lượt xem"
              >
                <Eye className="w-3.5 h-3.5 text-[#d97757]" />
                {Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                  story.views,
                )}
              </span>
              <span
                className="flex items-center gap-1.5 hover:text-[#faf9f5] transition-colors backdrop-blur-sm bg-black/20 px-2 py-1 rounded-md"
                title="Số chương"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#6a9bcc]" />
                {story.totalChapters}
              </span>
              <span
                className="flex items-center gap-1.5 text-right hover:text-[#faf9f5] transition-colors backdrop-blur-sm bg-black/20 px-2 py-1 w-28 rounded-md"
                title="Cập nhật"
              >
                <Clock className="w-5 h-5 text-[#788c5d]" />
                <span className="truncate max-w-[120px]">
                  {story.updatedAt &&
                  !isNaN(new Date(story.updatedAt).getTime())
                    ? formatDistanceToNow(new Date(story.updatedAt), {
                        locale: vi,
                      })
                    : "Vừa xong"}
                  {/* chỉ hiển số giờ như 2 giờ không có chữ khoảng đường trước*/}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
