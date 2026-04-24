"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { saveReadingProgress } from "@/app/actions/history";

export interface ReadingProgress {
  [storySlug: string]: {
    chapterNum: number;
    scrollPercentage: number;
    storyTitle?: string;
    coverUrl?: string;
    chapterTitle?: string;
    updatedAt?: number;
  };
}

interface ReadingProgressContextType {
  progress: ReadingProgress;
  updateProgress: (
    storySlug: string,
    chapterNum: number,
    scrollPercentage?: number,
    storyId?: number,
    chapterId?: number,
    metadata?: {
      storyTitle?: string;
      coverUrl?: string | null;
      chapterTitle?: string | null;
    },
  ) => void;
  getProgress: (storySlug: string) => ReadingProgress[string] | undefined;
}

const ReadingProgressContext = createContext<
  ReadingProgressContextType | undefined
>(undefined);

export function ReadingProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<ReadingProgress>({});
  const { data: session } = useSession();

  // 1. Load LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("novel-reading-progress");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse reading progress", e);
      }
    }
  }, []);

  // 2. Tự động sync DB từ LocalStorage khi có session đăng nhập
  // (Tính năng nâng cao: Gộp lịch sử offline vào online, nhưng tạm thời lưu cứng vào localStorage)
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem("novel-reading-progress", JSON.stringify(progress));
    }
  }, [progress]);

  // Hook cập nhật progress với tùy chọn đẩy lên server nếu có ID
  const updateProgress = useCallback(
    (
      storySlug: string,
      chapterNum: number,
      scrollPercentage: number = 0,
      storyId?: number,
      chapterId?: number,
      metadata?: {
        storyTitle?: string;
        coverUrl?: string | null;
        chapterTitle?: string | null;
      },
    ) => {
      setProgress((prev) => {
        const current = prev[storySlug];
        // Tránh rerender liên tục nếu không thay đổi chênh lệch quá nhiều %
        if (
          current?.chapterNum === chapterNum &&
          Math.abs(current.scrollPercentage - scrollPercentage) < 5 &&
          current?.storyTitle === metadata?.storyTitle
        ) {
          return prev;
        }
        return {
          ...prev,
          [storySlug]: {
            chapterNum,
            scrollPercentage,
            storyTitle: metadata?.storyTitle || current?.storyTitle,
            coverUrl: metadata?.coverUrl || current?.coverUrl,
            chapterTitle: metadata?.chapterTitle || current?.chapterTitle,
            updatedAt: Date.now(),
          },
        };
      });

      // Nếu truyền đủ ID và đã login, đẩy tiến độ đọc lên PostgreSQL
      if (session?.user?.id && storyId && chapterId) {
        saveReadingProgress(
          session.user.id,
          storyId,
          chapterId,
          scrollPercentage,
        ).catch((err) =>
          console.error("[Sync Error] Could not save progress to DB", err),
        );
      }
    },
    [session?.user?.id],
  );

  const getProgress = (storySlug: string) => {
    return progress[storySlug];
  };

  return (
    <ReadingProgressContext.Provider
      value={{ progress, updateProgress, getProgress }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  const context = useContext(ReadingProgressContext);
  if (context === undefined) {
    throw new Error(
      "useReadingProgress must be used within a ReadingProgressProvider",
    );
  }
  return context;
}
