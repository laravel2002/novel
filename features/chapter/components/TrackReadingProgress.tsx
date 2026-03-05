"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useEffect, useRef } from "react";
import { useReadingProgress } from "@/lib/contexts/ReadingProgressContext";

interface TrackReadingProgressProps {
  storySlug: string;
  chapterNum: number;
  storyId?: number;
  chapterId?: number;
  storyTitle?: string;
  coverUrl?: string | null;
  chapterTitle?: string | null;
}

export const TrackReadingProgress = ({
  storySlug,
  chapterNum,
  storyId,
  chapterId,
  storyTitle,
  coverUrl,
  chapterTitle,
}: TrackReadingProgressProps) => {
  const { updateProgress, getProgress } = useReadingProgress();
  const hasAutoScrolled = useRef(false);
  const scrollAttempts = useRef(0);

  useEffect(() => {
    // 1. Tự động cuộn đến vị trí đã lưu nếu có
    if (!hasAutoScrolled.current) {
      const savedProgress = getProgress(storySlug) as unknown as
        | { chapterNum?: number; scrollPercentage?: number }
        | number
        | undefined
        | null;
      // Dùng any tạm để parse legacy và object mới
      const savedChapter =
        typeof savedProgress === "object" && savedProgress !== null
          ? savedProgress.chapterNum
          : typeof savedProgress === "number"
            ? savedProgress
            : undefined;
      const savedPercentage =
        typeof savedProgress === "object" && savedProgress !== null
          ? savedProgress.scrollPercentage || 0
          : 0;

      // Chỉ cuộn nếu nó cùng chương được truy cập và có % cũ
      if (savedChapter === chapterNum && savedPercentage > 0) {
        const tryScroll = () => {
          if (hasAutoScrolled.current || scrollAttempts.current > 10) return; // Dừng lại sau 10 lần thử (khoảng 5s)
          scrollAttempts.current += 1;

          const scrollHeight =
            document.documentElement.scrollHeight - window.innerHeight;

          // Chiều cao phải hợp lý (trên 1000px) mới chứng tỏ tải xong nội dung chữ. Nếu ảnh load sau thì nó sẽ giãn thêm.
          if (scrollHeight > 500) {
            window.scrollTo({
              top: (savedPercentage / 100) * scrollHeight,
              behavior: "auto", // 'auto' mượt hơn 'smooth' khi trang đang giật vì load
            });

            // Đánh dấu đã cuộn thành công nếu scrollY > 0
            if (window.scrollY > 0 || savedPercentage < 1) {
              hasAutoScrolled.current = true;
              return;
            }
          }

          // Thử lại sau 500ms nếu chưa cuộn được
          setTimeout(tryScroll, 500);
        };

        setTimeout(tryScroll, 100); // Thử lần đầu tiên sau 100ms
      } else {
        hasAutoScrolled.current = true; // Không có gì để cuộn
      }
    }

    const handleScroll = () => {
      // Đợi auto scroll chạy xong mới bắt đầu lắng nghe và lưu
      if (!hasAutoScrolled.current) return;

      // Tính phần trăm cuộn của trang web
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percentage = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      // Giới hạn trong khoảng 0-100
      const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

      updateProgress(
        storySlug,
        chapterNum,
        clampedPercentage,
        storyId,
        chapterId,
        {
          storyTitle,
          coverUrl,
          chapterTitle,
        },
      );
    };

    // Tạo closure setTimeout để tránh lỗi gọi hàm liên tục
    const initialSaveTimeout = setTimeout(() => {
      if (hasAutoScrolled.current) {
        handleScroll();
      }
    }, 1000);

    // Sử dụng event listener nhưng cần throttle/debounce (giả lập đơn giản cho demo)
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        handleScroll();
      }, 500); // Cứ 500ms dừng vuốt thì cập nhật 1 lần
    };

    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(initialSaveTimeout);
    };
  }, [
    storySlug,
    chapterNum,
    storyId,
    chapterId,
    updateProgress,
    getProgress,
    storyTitle,
    coverUrl,
    chapterTitle,
  ]);

  return null;
};
