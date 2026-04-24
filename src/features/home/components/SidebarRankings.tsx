import Image from "next/image";
import Link from "next/link";
import {
  IconFlame,
  IconTrendingUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import { RankingListSkeleton } from "@/features/ranking/components/RankingItemSkeleton";

interface Story {
  id: number;
  title: string;
  slug: string;
  views: number;
  rating?: number;
  coverUrl: string | null;
}

function RankingListItem({
  item,
  index,
  isHot = false,
}: {
  item: Story;
  index: number;
  isHot?: boolean;
}) {
  const isTop1 = index === 0;

  if (isTop1) {
    return (
      <Link
        href={`/truyen/${item.slug || item.id}`}
        className="group flex items-center gap-4 bg-[#111113] p-3 rounded-xl border border-white/5 hover:bg-[#15151a] hover:border-white/10 transition-colors mb-4 cursor-pointer"
      >
        {/* Thumbnail for Rank 1 */}
        <div className="relative w-14 h-20 shrink-0 rounded-md overflow-hidden bg-zinc-900 shadow-md">
          <Image
            src={getImageUrl(item.coverUrl)}
            alt={`Bìa ${item.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="56px"
          />
          {/* Rank Badge */}
          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shadow-md border-2 border-[#111113]">
            1
          </div>
        </div>

        {/* Content for Rank 1 */}
        <div className="flex flex-col min-w-0 flex-1 justify-center space-y-1">
          <h4 className="font-heading font-bold text-[15px] leading-tight text-orange-400 line-clamp-2 group-hover:text-orange-300 transition-colors">
            {item.title}
          </h4>
          <p className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
            <span className="text-[10px]">👁</span>{" "}
            {item.views.toLocaleString()}
          </p>
        </div>
      </Link>
    );
  }

  // Ranks 2-10
  const isTop3 = index < 3;
  return (
    <div className="group flex items-center gap-3 py-2.5 px-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-sm shrink-0 text-[11px] font-bold text-white/50 bg-white/5",
          isTop3 && "text-orange-400 bg-orange-500/10",
        )}
      >
        {index + 1}
      </div>

      <Link href={`/truyen/${item.slug || item.id}`} className="flex-1 min-w-0">
        <h4 className="font-medium text-[13px] text-white/80 group-hover:text-primary transition-colors truncate">
          {item.title}
        </h4>
      </Link>

      <div className="text-[11px] font-semibold text-white/30 shrink-0">
        {item.views.toLocaleString()}
      </div>
    </div>
  );
}

function RankingList({
  title,
  data,
  icon: Icon,
  isHot,
}: {
  title: string;
  data: Story[];
  icon: React.ElementType;
  isHot?: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 relative">
        <div className="absolute -bottom-[1px] left-0 w-8 h-[2px] bg-orange-500 rounded-full" />
        <h3 className="font-heading text-sm font-black uppercase text-white flex items-center gap-2 tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          {title}
        </h3>
        <Link
          href="/bang-xep-hang"
          className="text-[10px] font-bold uppercase text-white/40 hover:text-white transition-colors flex items-center gap-0.5 tracking-wider"
        >
          Xem thêm <IconChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List */}
      <div className="flex flex-col text-sm">
        {data.slice(0, 10).map((item, index) => (
          <RankingListItem
            key={item.id}
            item={item}
            index={index}
            isHot={isHot}
          />
        ))}
      </div>
    </div>
  );
}

export function SidebarRankings({
  topViews = [],
  hotStories = [],
}: {
  topViews?: Story[];
  hotStories?: Story[];
}) {
  if (topViews.length === 0 && hotStories.length === 0) {
    return (
      <aside className="w-full flex flex-col gap-10 sticky top-24 pt-2">
        <RankingListSkeleton />
        <RankingListSkeleton />
      </aside>
    );
  }

  return (
    <aside className="w-full flex flex-col gap-10 sticky top-24 pt-2">
      <RankingList title="Top Lượt Xem" icon={IconTrendingUp} data={topViews} />
      <RankingList
        title="Truyện Đang Hot"
        icon={IconFlame}
        data={hotStories}
        isHot
      />
    </aside>
  );
}
