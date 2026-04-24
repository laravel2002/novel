"use client";

import { useReadingSettings } from "@/lib/contexts/ReadingSettingsContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
// Nếu bị compile chậm, nhớ đổi thành: import IconBook2 from "@tabler/icons-react/dist/esm/icons/IconBook2";
import { IconBook2, IconMessageCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const AudioPlayer = dynamic(
  () => import("./AudioPlayer").then((mod) => mod.AudioPlayer),
  { ssr: false },
);

const InlineCommentDrawer = dynamic(
  () => import("./InlineCommentDrawer").then((mod) => mod.InlineCommentDrawer),
  { ssr: false },
);
import { useAudioStore } from "@/lib/store/audio-store";

interface ChapterContentProps {
  storyId: number;
  chapterId: number;
  userId: string | null;
  storyTitle: string;
  storySlug: string;
  author: string | null;
  chapterNum: number;
  chapterTitle: string | null;
  content: string;
  nextChapterUrl: string | null;
  prevChapterUrl: string | null;
}

export function ChapterContent({
  storyId,
  chapterId,
  userId,
  storyTitle,
  storySlug,
  author,
  chapterNum,
  chapterTitle,
  content,
  nextChapterUrl,
  prevChapterUrl,
}: ChapterContentProps) {
  const { settings } = useReadingSettings();
  const { isOpen: isAudioOpen, setIsOpen: setIsAudioOpen } = useAudioStore();

  const [commentOpen, setCommentOpen] = useState(false);
  const [activeCommentParaId, setActiveCommentParaId] = useState<number | null>(
    null,
  );

  const [visibleActionsParaId, setVisibleActionsParaId] = useState<
    number | null
  >(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef<number>(0);
  const ignoreNextClick = useRef(false);

  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPress = (
    index: number,
    e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => {
    clearPressTimer();
    if ("touches" in e) {
      touchStartY.current = e.touches[0].clientY;
    }
    pressTimer.current = setTimeout(() => {
      setVisibleActionsParaId(index);
      ignoreNextClick.current = true;
      if (
        typeof window !== "undefined" &&
        window.navigator &&
        window.navigator.vibrate
      ) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const currentY = e.touches[0].clientY;
    if (Math.abs(currentY - touchStartY.current) > 10) {
      clearPressTimer();
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ignoreNextClick.current) {
        ignoreNextClick.current = false;
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest(".comment-btn")) return;
      setVisibleActionsParaId(null);
    };

    window.addEventListener("click", handleClick, true);
    window.addEventListener("scroll", clearPressTimer);
    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("scroll", clearPressTimer);
    };
  }, []);

  // 1. ÁP DỤNG NORMALIZE Ở ĐÂY:
  // Gộp các ký tự dấu rời rạc thành chữ cái hoàn chỉnh trước khi cắt thành đoạn văn
  const cleanContent = content ? content.normalize("NFC") : "";
  const paragraphs = cleanContent.split(/\r?\n/).filter((p) => p.trim() !== "");

  // 2. Normalize cả tiêu đề phòng trường hợp chúng cũng bị lỗi
  const safeChapterTitle = chapterTitle ? chapterTitle.normalize("NFC") : "";
  const safeStoryTitle = storyTitle ? storyTitle.normalize("NFC") : "";

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 3. Lấy số lượng bình luận theo từng đoạn văn (cho icon hiển thị tổng)
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: commentCounts } = useSWR<Record<number, number>>(
    `/api/comments/chapter/${chapterId}/counts`,
    fetcher,
    { refreshInterval: 60000 },
  );

  // Background Prefetching cho bàn phím (Arrow Keys) & thao tác chuyển mượt
  useEffect(() => {
    // Để App Router next.js nạp nội dung (RSC payload) của các chương trước / sau
    // ngay khi user đang đọc. Độ trễ bấm qua chương khác sẽ giảm sâu.
    if (nextChapterUrl) {
      router.prefetch(nextChapterUrl);
    }
    if (prevChapterUrl) {
      router.prefetch(prevChapterUrl);
    }
  }, [nextChapterUrl, prevChapterUrl, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent navigation if the user is typing in an input or textarea (like commenting)
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" && nextChapterUrl) {
        startTransition(() => {
          router.push(nextChapterUrl);
        });
      } else if (e.key === "ArrowLeft" && prevChapterUrl) {
        startTransition(() => {
          router.push(prevChapterUrl);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextChapterUrl, prevChapterUrl, router]);

  return (
    <>
      <div className="prose dark:prose-invert max-w-5xl mx-auto mb-12 bg-card shadow-lg rounded-xl border p-5 sm:p-8 md:p-12 transition-all duration-300">
        {/* 2. Hiển thị tiêu đề chuẩn (tránh lặp chữ Chương) */}
        <div className="flex justify-between items-start mb-4 mt-2">
          <h1 className="text-4xl font-bold flex-1 text-center leading-tight">
            {safeChapterTitle || `Chương ${chapterNum}`}
          </h1>
        </div>

        <div className="text-center text-muted-foreground text-base mb-10 flex items-center justify-center gap-3 flex-wrap">
          <IconBook2 className="w-5 h-5" />
          <Link
            href={`/truyen/${storySlug}`}
            className="hover:text-primary transition-colors font-medium"
          >
            {safeStoryTitle}
          </Link>
          <span>•</span>
          <span>{author || "Đang cập nhật"}</span>
        </div>

        <div
          className={cn(
            "tracking-wide transition-all duration-300",
            settings.fontFamily,
            settings.textAlign === "justify" ? "text-justify" : "text-left",
            settings.readingMode === "pagination" && "px-4",
          )}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            ...(settings.readingMode === "pagination"
              ? {
                  columnWidth: "100%",
                  columnGap: "3rem",
                  height: "75vh",
                  overflowX: "auto",
                  overflowY: "hidden",
                  paddingBottom: "1rem",
                }
              : {}),
          }}
        >
          {/* 3. Render từng mẩu text vào thẻ HTML <p> với wrapper relative */}
          {paragraphs.map((paragraph, index) => {
            const commentCount = commentCounts?.[index] || 0;

            return (
              <div
                key={index}
                className="relative mb-6 pr-10 sm:pr-12 transition-colors duration-500"
                ref={(el) => {
                  paragraphRefs.current[index] = el;
                }}
                onDoubleClick={() => {
                  setActiveCommentParaId(index);
                  setCommentOpen(true);
                }}
                onTouchStart={(e) => startPress(index, e)}
                onTouchEnd={clearPressTimer}
                onTouchMove={handleTouchMove}
                onTouchCancel={clearPressTimer}
                onMouseDown={(e) => startPress(index, e)}
                onMouseUp={clearPressTimer}
                onMouseLeave={clearPressTimer}
              >
                <p
                  className={cn(
                    "leading-relaxed rounded-md px-2 -mx-2 transition-colors duration-300",
                    visibleActionsParaId === index && "bg-primary/5",
                  )}
                >
                  {paragraph}
                </p>

                {/* Nút hiện bình luận ở bên phải (nằm trong vùng padding để không bị cắt) */}
                <div className="absolute top-0.5 right-0 sm:right-1 h-full flex items-start">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "comment-btn rounded-full w-8 h-8 text-muted-foreground hover:bg-primary/10 hover:text-primary z-10 shadow-sm transition-all duration-300 relative",
                      commentCount > 0
                        ? "opacity-100 flex scale-100"
                        : visibleActionsParaId === index
                          ? "opacity-100 flex scale-100"
                          : "opacity-0 hidden scale-75",
                    )}
                    onClick={() => {
                      setActiveCommentParaId(index);
                      setCommentOpen(true);
                    }}
                    title="Bình luận đoạn văn này"
                  >
                    <IconMessageCircle className="w-4 h-4" />
                    {commentCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {commentCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {commentOpen && (
        <InlineCommentDrawer
          isOpen={commentOpen}
          onClose={() => setCommentOpen(false)}
          storyId={storyId}
          chapterId={chapterId}
          userId={userId}
          paragraphId={activeCommentParaId}
          paragraphText={
            activeCommentParaId !== null ? paragraphs[activeCommentParaId] : ""
          }
        />
      )}

      {isAudioOpen && (
        <AudioPlayer
          paragraphs={paragraphs}
          nextChapterUrl={nextChapterUrl}
          prevChapterUrl={prevChapterUrl}
          chapterTitle={safeChapterTitle || `Chương ${chapterNum}`}
          isOpen={isAudioOpen}
          onClose={() => setIsAudioOpen(false)}
          onParagraphChange={() => {}}
        />
      )}
    </>
  );
}
