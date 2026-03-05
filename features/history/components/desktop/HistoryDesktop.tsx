import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { HistoryViewProps } from "../HistoryUI";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryDesktop({
  histories,
  isLoading,
  onRemove,
  onClearAll,
}: HistoryViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border border-border/50 rounded-xl bg-secondary/10"
          >
            <Skeleton className="w-16 h-24 rounded-md" />
            <div className="flex-1 space-y-2 py-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="w-10"></div>
          </div>
        ))}
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-border/50">
        <p className="text-lg">Bạn chưa có lịch sử đọc truyện nào.</p>
        <Link
          href="/kham-pha"
          className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-md hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid gap-4">
        {histories.map((history) => (
          <div
            key={history.storyId}
            className="group flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:bg-secondary/20 transition-all shadow-sm hover:shadow-md"
          >
            <Link
              href={`/truyen/${history.storySlug}/chuong-${history.chapterNum}`}
              className="flex items-center gap-6 flex-1 min-w-0"
            >
              {/* Cover */}
              <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {history.coverUrl ? (
                  <Image
                    src={history.coverUrl}
                    alt={history.storyTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-muted-foreground text-xs font-medium">
                      No Cover
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0 py-1">
                <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                  {history.storyTitle}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    Chương {history.chapterNum}
                  </span>
                  {history.chapterTitle && (
                    <>
                      <span>•</span>
                      <span className="truncate">{history.chapterTitle}</span>
                    </>
                  )}
                </div>

                {/* Progress bar info optional */}
                {history.scrollPercentage !== undefined &&
                  history.scrollPercentage > 0 && (
                    <div className="mt-3 flex items-center gap-2 max-w-xs">
                      <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${history.scrollPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {Math.round(history.scrollPercentage)}%
                      </span>
                    </div>
                  )}

                <div className="mt-auto pt-1 text-xs text-muted-foreground/60">
                  Đọc lúc:{" "}
                  {formatDistanceToNow(new Date(history.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </div>
              </div>
            </Link>

            {/* Actions */}
            <div className="pl-6 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(history.storyId);
                }}
                className="p-2 text-muted-foreground hover:text-destructive bg-secondary/0 hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Xóa khỏi lịch sử"
                title="Xóa khỏi lịch sử"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
