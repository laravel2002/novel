"use client";

import Link from "next/link";
import Image from "next/image";
import { Story } from "@/generated/prisma/client";
import { getImageUrl } from "@/lib/utils";
import { IconStarFilled } from "@tabler/icons-react";

interface TrendingCarouselProps {
  stories: Story[];
}

export function TrendingCarousel({ stories }: TrendingCarouselProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground text-sm">
        Chưa có dữ liệu truyện hot.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 snap-x snap-mandatory flex gap-4">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/truyen/${story.slug}`}
          className="snap-start shrink-0 w-[140px] flex flex-col group"
        >
          <div className="w-full aspect-[2/3] relative rounded-xl overflow-hidden mb-2 shadow-sm border border-border/50">
            <Image
              src={getImageUrl(story.coverUrl)}
              alt={story.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="140px"
            />
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-md">
                <IconStarFilled className="w-3 h-3" />
                {story.rating?.toFixed(1) || "0.0"}
              </div>
            </div>
          </div>

          <h3 className="font-heading font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {story.author || "Đang cập nhật"}
          </p>
        </Link>
      ))}
    </div>
  );
}
