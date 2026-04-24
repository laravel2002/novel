import Image from "next/image";
import Link from "next/link";
import { cn, getImageUrl } from "@/lib/utils";
import { IconEye } from "@tabler/icons-react";
import { Crown } from "lucide-react";

interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  views: number;
  rankViews?: number;
  rating?: number;
  description?: string | null;
  category?: { name: string };
}

export function RankingList({
  stories,
  type,
}: {
  stories: Story[];
  type?: string;
}) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border/20">
        Chưa có dữ liệu xếp hạng.
      </div>
    );
  }

  const top3 = stories.slice(0, 3);
  const remainingStories = stories.slice(3);

  // Sắp xếp lại mảng Top 3 để render theo thứ tự hiển thị: Top 2 - Top 1 - Top 3
  const podiumOrder = [
    { story: top3[1], rank: 2 },
    { story: top3[0], rank: 1 },
    { story: top3[2], rank: 3 },
  ].filter((item) => item.story !== undefined);

  return (
    <div className="flex flex-col gap-10 w-full pb-10">
      {/* ========================================== */}
      {/* KHU VỰC TOP 3 - BỤC VINH QUANG             */}
      {/* ========================================== */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end gap-4 sm:gap-6 mt-6">
          {podiumOrder.map((item) => (
            <PodiumCard
              key={item.story.id}
              story={item.story}
              rank={item.rank}
            />
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* KHU VỰC DANH SÁCH TỪ TOP 4 TRỞ ĐI          */}
      {/* ========================================== */}
      {remainingStories.length > 0 && (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
          {remainingStories.map((story, index) => (
            <PremiumListItem key={story.id} story={story} rank={index + 4} />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: THẺ BỤC VINH QUANG (TOP 1-2-3)
// ==========================================
function PodiumCard({ story, rank }: { story: Story; rank: number }) {
  const isTop1 = rank === 1;

  const styles = {
    1: {
      wrapper: "w-[120px] sm:w-[150px] z-10",
      border: "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]",
      icon: (
        <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 fill-yellow-500" />
      ),
    },
    2: {
      wrapper: "w-[100px] sm:w-[120px] mb-0 sm:mb-4",
      border: "border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
      icon: (
        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 fill-slate-300" />
      ),
    },
    3: {
      wrapper: "w-[100px] sm:w-[120px] mb-0 sm:mb-4",
      border: "border-orange-600/50 shadow-[0_0_15px_rgba(234,88,12,0.1)]",
      icon: (
        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 fill-orange-500" />
      ),
    },
  }[rank as 1 | 2 | 3];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center group",
        styles.wrapper,
      )}
    >
      {/* Icon Vương miện đè lên trên thẻ */}
      <div className="absolute -top-4 sm:-top-5 z-20 drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
        {styles.icon}
      </div>

      <Link
        href={`/truyen/${story.slug || story.id}`}
        className={cn(
          "flex flex-col items-center w-full bg-card/40 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border transition-all duration-300 group-hover:-translate-y-1",
          styles.border,
        )}
      >
        <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden shadow-md mt-3 sm:mt-4">
          <Image
            src={getImageUrl(story.coverUrl)}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100px, 140px"
          />
          {/* Label Rank (#1, #2, #3) đè dưới đáy ảnh */}
          <div className="absolute bottom-0 left-0 w-full bg-black/70 backdrop-blur-sm py-0.5 sm:py-1">
            <div className="text-center font-black text-xs sm:text-sm text-white">
              #{rank}
            </div>
          </div>
        </div>

        <div className="w-full mt-3 flex flex-col items-center">
          <h3 className="text-xs sm:text-sm font-bold text-center text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-orange-500 mt-1">
            <IconEye className="w-3.5 h-3.5" />
            <span>{(story.rankViews ?? story.views).toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ==========================================
// COMPONENT: THẺ DANH SÁCH (TOP 4 TRỞ ĐI)
// ==========================================
function PremiumListItem({ story, rank }: { story: Story; rank: number }) {
  return (
    <Link
      href={`/truyen/${story.slug || story.id}`}
      className="group flex items-center gap-3 sm:gap-5 py-2 sm:py-3 px-2 rounded-lg hover:bg-muted/30 transition-colors"
    >
      {/* Cột Số thứ tự (To, mờ, in nghiêng) */}
      <div className="w-8 sm:w-12 shrink-0 flex justify-center">
        <span className="font-light italic text-2xl sm:text-4xl text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
          {rank.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Cột Ảnh bìa */}
      <div className="shrink-0 relative">
        <div className="w-10 sm:w-12 aspect-[2/3] relative rounded overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
          <Image
            src={getImageUrl(story.coverUrl)}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 40px, 48px"
          />
        </div>
      </div>

      {/* Cột Thông tin chi tiết */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
          {story.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[120px]">
            {story.author || "Đang cập nhật"}
          </span>

          {story.category && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="truncate">{story.category.name}</span>
            </>
          )}

          {/* Phần mô tả ngắn gọn (nếu cần hiển thị trên màn hình lớn) */}
          {story.description && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden sm:block" />
              <span className="hidden sm:inline-block truncate max-w-[200px] opacity-70">
                {story.description}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Cột Lượt xem (Căn phải, màu cam nổi bật) */}
      <div className="shrink-0 flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-500 pr-2">
        <IconEye className="w-4 h-4" />
        <span>{(story.rankViews ?? story.views).toLocaleString()}</span>
      </div>
    </Link>
  );
}
