import Image from "next/image";
import Link from "next/link";
import {
  IconFlame,
  IconStar,
  IconHeart,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import RankingItemSkeleton from "@/features/ranking/components/RankingItemSkeleton";

interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  views: number;
  category?: { name: string };
}

function RankingColumn({
  title,
  data,
  icon: Icon,
  accentColor,
  href = "/bang-xep-hang",
}: {
  title: string;
  data: Story[];
  icon: React.ElementType;
  accentColor: "orange" | "blue" | "green";
  href?: string;
}) {
  const accentConfigs = {
    orange: {
      text: "text-orange-500",
      bg: "bg-orange-500",
      bgSoft: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    blue: {
      text: "text-blue-500",
      bg: "bg-blue-500",
      bgSoft: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    green: {
      text: "text-green-500",
      bg: "bg-green-500",
      bgSoft: "bg-green-500/10",
      border: "border-green-500/20",
    },
  };

  const config = accentConfigs[accentColor];

  return (
    <div className="flex flex-col bg-[#111113] rounded-2xl p-5 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-sm font-black uppercase text-white flex items-center gap-2 tracking-wider">
          <div
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
              config.bg,
              `shadow-${accentColor}-500/50`,
            )}
          />
          {title}
        </h3>
        <Link
          href={href}
          className="text-[10px] font-bold uppercase text-white/30 hover:text-white transition-colors flex items-center gap-0.5 tracking-wider"
        >
          Xem thêm <IconChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List */}
      <div className="flex flex-col text-sm space-y-1">
        {data.length > 0 ? (
          data.slice(0, 10).map((item, index) => {
            const rank = index + 1;
            const isTop1 = rank === 1;

            if (isTop1) {
              return (
                <Link
                  key={item.id}
                  href={`/truyen/${item.slug || item.id}`}
                  className="group relative flex items-center gap-4 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors mb-3 cursor-pointer"
                >
                  {/* Thumbnail for Rank 1 */}
                  <div className="relative w-[72px] h-[100px] shrink-0 rounded-md overflow-hidden bg-zinc-900 shadow-md">
                    <Image
                      src={getImageUrl(item.coverUrl)}
                      alt={`Bìa ${item.title}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="72px"
                    />
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "absolute -top-1 -left-1 w-6 h-6 rounded-md text-white text-xs font-black flex items-center justify-center shadow-md",
                        config.bg,
                      )}
                    >
                      1
                    </div>
                  </div>

                  {/* Content for Rank 1 */}
                  <div className="flex flex-col min-w-0 flex-1 justify-center space-y-1.5">
                    <h4
                      className={cn(
                        "font-heading font-bold text-base leading-tight line-clamp-2 transition-colors",
                        config.text,
                        `group-hover:text-white`,
                      )}
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 font-medium truncate">
                      <span className="text-[10px]">🖊</span>{" "}
                      {item.author || "Đang cập nhật"}
                    </p>
                    <p className="text-[11px] text-white/30 flex items-center gap-1 font-medium mt-1">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                          config.bgSoft,
                          config.text,
                        )}
                      >
                        {item.views.toLocaleString()} lượt
                      </span>
                    </p>
                  </div>
                </Link>
              );
            }

            // Ranks 2-10
            const isTop3 = rank <= 3;
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 py-2.5 px-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full shrink-0 text-[10px] font-black text-white/50 bg-white/5",
                    isTop3 && cn(config.text, config.bgSoft),
                  )}
                >
                  {rank}
                </div>

                <Link
                  href={`/truyen/${item.slug || item.id}`}
                  className="flex-1 min-w-0"
                >
                  <h4 className="font-medium text-[13px] text-white/70 group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h4>
                </Link>

                <div className="text-[11px] font-semibold text-white/30 shrink-0">
                  {item.views.toLocaleString()}
                </div>
              </div>
            );
          })
        ) : (
          <>
            <RankingItemSkeleton isTop1={true} />
            {Array.from({ length: 9 }).map((_, idx) => (
              <RankingItemSkeleton key={idx} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function ThreeColRankings({
  nominations = [],
  topViews = [],
  favorites = [],
}: {
  nominations?: Story[];
  topViews?: Story[];
  favorites?: Story[];
}) {
  return (
    <section className="relative w-full pt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-heading font-black text-white tracking-wide">
          Bảng Xếp Hạng
        </h2>
        <div className="h-[2px] w-24 bg-gradient-to-r from-orange-500 to-transparent rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingColumn
          title="Nổi Bật"
          icon={IconStar}
          accentColor="orange"
          data={nominations}
          href="/bang-xep-hang?type=recommended"
        />
        <RankingColumn
          title="Xem Nhiều"
          icon={IconFlame}
          accentColor="blue"
          data={topViews}
          href="/bang-xep-hang?type=views"
        />
        <RankingColumn
          title="Yêu Thích"
          icon={IconHeart}
          accentColor="green"
          data={favorites}
          href="/bang-xep-hang?type=favorites"
        />
      </div>
    </section>
  );
}
