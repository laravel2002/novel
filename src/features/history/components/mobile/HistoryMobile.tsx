import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { HistoryViewProps } from "../HistoryUI";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryMobile({
  histories,
  isLoading,
  onRemove,
  onClearAll,
}: HistoryViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 border-b border-border/40">
            <Skeleton className="w-[3.5rem] h-[5rem] rounded-md" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <div className="py-16 mt-4 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-border/50 mx-4">
        <p className="text-base px-4">Bạn chưa có lịch sử đọc truyện nào.</p>
        <Link
          href="/kham-pha"
          className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full"
        >
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-6">
      <div className="flex justify-between items-center px-4 py-2 border-b border-border/20">
        <span className="text-sm font-medium text-foreground/80">
          Đã đọc {histories.length} truyện
        </span>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-2 py-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa tất cả
        </button>
      </div>

      <div className="flex flex-col">
        {histories.map((history) => (
          <div
            key={history.storyId}
            className="flex items-start justify-between p-4 border-b border-border/40 active:bg-secondary/20 transition-colors"
          >
            <Link
              href={`/truyen/${history.storySlug}/chuong-${history.chapterNum}`}
              className="flex items-start gap-3 flex-1 min-w-0"
            >
              {/* Cover */}
              <div className="relative w-[3.5rem] h-[5rem] flex-shrink-0 rounded-sm overflow-hidden bg-muted">
                {history.coverUrl ? (
                  <Image
                    src={history.coverUrl}
                    alt={history.storyTitle}
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0 h-[5rem]">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">
                  {history.storyTitle}
                </h3>

                <div className="mt-1 text-xs text-primary font-medium">
                  Chương {history.chapterNum}
                </div>

                <div className="mt-auto text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(history.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </div>
              </div>
            </Link>

            {/* Actions */}
            <div className="pl-2 pt-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(history.storyId);
                }}
                className="p-2 text-muted-foreground/60 hover:text-destructive active:bg-destructive/10 rounded-full"
                aria-label="Xóa khỏi lịch sử"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
