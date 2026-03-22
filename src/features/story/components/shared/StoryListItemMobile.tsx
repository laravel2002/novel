import Link from "next/link";
import Image from "next/image";
import { Status } from "@/generated/prisma/client";
import { Eye, BookOpen, Clock, Star } from "lucide-react";
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

interface StoryListItemMobileProps {
  story: Story;
  index?: number;
}

export default function StoryListItemMobile({
  story,
  index = 0,
}: StoryListItemMobileProps) {
  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group relative flex items-start gap-4 w-full bg-card border border-border/50 rounded-2xl p-3 overflow-hidden shadow-sm active:scale-[0.98] transition-transform isolate"
    >
      {/* Cover Image Container */}
      <div className="relative shrink-0 w-[80px] sm:w-[100px] aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-border/50 bg-muted">
        <Image
          src={getImageUrl(story.coverUrl)}
          alt={`Bìa truyện ${story.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100px, 120px"
        />

        {/* Badges on image */}
        <div className="absolute top-1 left-1 right-1 flex flex-col gap-1 items-start">
          {story.status === "COMPLETED" && (
            <span className="bg-[#788c5d]/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
              Full
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full py-0.5 justify-between">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold leading-tight text-foreground line-clamp-2 mb-1 group-active:text-primary transition-colors">
            {story.title}
          </h3>

          <p className="text-xs text-muted-foreground truncate font-medium mb-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-primary">✍</span>
            {story.author || "Vô Danh"}
          </p>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <Star className="w-3 h-3 fill-amber-500" />
              {(story.rating ?? 0).toFixed(1)}
            </div>
            {story.categories && story.categories.length > 0 && (
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold truncate max-w-[100px]">
                {story.categories[0].name}
              </span>
            )}
          </div>
        </div>

        {/* Description Snippet */}
        {story.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 opacity-90 hidden sm:block">
            {story.description.replace(/<[^>]*>?/gm, "")}
          </p>
        )}

        {/* Footer Meta */}
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-medium text-muted-foreground/80 mt-auto pt-2 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
              story.views,
            )}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {story.totalChapters}
          </span>
          <span className="flex items-center gap-1 ml-auto truncate">
            <Clock className="w-3.5 h-3.5" />
            {story.updatedAt && !isNaN(new Date(story.updatedAt).getTime())
              ? formatDistanceToNow(new Date(story.updatedAt), {
                  locale: vi,
                }).replace("khoảng ", "")
              : "Vừa xong"}
          </span>
        </div>
      </div>
    </Link>
  );
}
