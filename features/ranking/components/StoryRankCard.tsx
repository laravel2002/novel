import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LeaderboardStory } from "@/services/leaderboard";
import {
  Eye,
  Flame,
  Heart,
  MessageCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryRankCardProps {
  story: LeaderboardStory;
  rank: number;
  category: string;
}

export function StoryRankCard({ story, rank, category }: StoryRankCardProps) {
  // Determine gradient, colors, and badge for top 3
  const isTop3 = rank <= 3;
  let rankColor = "text-muted-foreground";
  let badgeColor = "bg-muted text-muted-foreground";
  let borderStyle = "border-border";

  if (rank === 1) {
    rankColor = "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
    badgeColor =
      "bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/20";
    borderStyle = "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10";
  } else if (rank === 2) {
    rankColor = "text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]";
    badgeColor =
      "bg-gradient-to-r from-slate-300 to-slate-500 text-white border-0 shadow-lg shadow-slate-500/20";
    borderStyle = "border-slate-500/30 bg-slate-500/5 dark:bg-slate-500/10";
  } else if (rank === 3) {
    rankColor =
      "text-orange-700 dark:text-orange-400 drop-shadow-[0_0_8px_rgba(194,65,12,0.5)]";
    badgeColor =
      "bg-gradient-to-r from-orange-400 to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20";
    borderStyle = "border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/10";
  }

  // Render correct icon based on category
  const getIcon = () => {
    switch (category) {
      case "views":
        return <Eye className="w-4 h-4 mr-1 text-primary" />;
      case "votes":
        return <Star className="w-4 h-4 mr-1 text-primary" />;
      case "donates":
        return <Flame className="w-4 h-4 mr-1 text-primary" />;
      case "trending":
        return <TrendingUp className="w-4 h-4 mr-1 text-primary" />;
      case "bookmarks":
        return <Heart className="w-4 h-4 mr-1 text-primary" />;
      case "comments":
        return <MessageCircle className="w-4 h-4 mr-1 text-primary" />;
      default:
        return <Eye className="w-4 h-4 mr-1 text-primary" />;
    }
  };

  const getLabel = () => {
    switch (category) {
      case "views":
        return "Lượt đọc";
      case "votes":
        return "Đề cử";
      case "donates":
        return "Tặng thưởng";
      case "trending":
        return "Điểm thịnh hành";
      case "bookmarks":
        return "Lượt thêm tủ";
      case "comments":
        return "Bình luận";
      default:
        return "Lượt đọc";
    }
  };

  return (
    <Link href={`/truyen/${story.slug}`}>
      <div
        className={cn(
          "group relative flex items-center gap-4 sm:gap-6 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card overflow-hidden",
          borderStyle,
        )}
      >
        {/* Lớp Overlay Effect khi hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

        {/* Rank Number */}
        <div className="flex-shrink-0 w-8 sm:w-12 text-center flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-3xl sm:text-5xl font-black italic tracking-tighter transition-transform group-hover:scale-110",
              rankColor,
            )}
          >
            {rank}
          </span>

          {isTop3 && (
            <div
              className={cn(
                "text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-full",
                badgeColor,
              )}
            >
              Top {rank}
            </div>
          )}
        </div>

        {/* Cover Image */}
        <div className="flex-shrink-0 relative w-[60px] h-[80px] sm:w-[80px] sm:h-[106px] rounded-md overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
          {story.coverUrl ? (
            <Image
              src={story.coverUrl}
              alt={story.title}
              fill
              sizes="(max-width: 640px) 60px, 80px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs font-medium">
                No Cover
              </span>
            </div>
          )}
          {/* Status Indicator on Book Cover */}
          <div className="absolute top-0 right-0">
            {story.status === "COMPLETED" ? (
              <div className="bg-primary/90 text-primary-foreground text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md backdrop-blur-sm">
                FULL
              </div>
            ) : (
              <div className="bg-green-500/90 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md backdrop-blur-sm">
                HOT
              </div>
            )}
          </div>
        </div>

        {/* Story Details */}
        <div className="flex flex-col flex-grow min-w-0 py-1">
          <h3 className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {story.title}
          </h3>

          <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1 mb-2">
            <span className="truncate max-w-[120px] sm:max-w-none">
              {story.author || "Đang cập nhật"}
            </span>
            <span className="mx-2 opacity-50">•</span>
            <span className="font-medium text-foreground">
              {formatNumber(story.chapterCount)}
            </span>
            <span className="ml-1 opacity-70">chương</span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            {/* Categories/Tags */}
            <div className="flex items-center gap-1.5 overflow-hidden">
              {story.categories?.slice(0, 2).map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className="px-1.5 lg:px-2 py-0 h-5 text-[10px] font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground border-transparent whitespace-nowrap"
                >
                  {cat.name}
                </Badge>
              ))}
              {story.categories && story.categories.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{story.categories.length - 2}
                </span>
              )}
            </div>

            {/* Primary Statistic */}
            <div className="flex items-center ml-2 bg-primary/10 dark:bg-primary/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
              {getIcon()}
              <span className="text-xs sm:text-sm font-bold text-primary">
                {category === "donates"
                  ? `${formatNumber(story.primaryStat)}đ`
                  : formatNumber(story.primaryStat)}
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs text-primary/70 font-medium">
                {getLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
