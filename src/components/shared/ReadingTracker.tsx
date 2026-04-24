"use client";

import { useEffect } from "react";
import { saveReadingProgress } from "@/app/actions/history";

interface ReadingTrackerProps {
  userId?: string; // Tùy thuộc vào hệ thống auth của bạn (NextAuth, Clerk...)
  storyId: number;
  chapterId: number;
  chapterSlug: string; // VD: "chuong-1" để lưu cho LocalStorage dễ điều hướng
}

export function ReadingTracker({ userId, storyId, chapterId, chapterSlug }: ReadingTrackerProps) {
  useEffect(() => {
    // 1. Lưu vào Database nếu user đã đăng nhập
    if (userId) {
      saveReadingProgress(userId, storyId, chapterId);
    }

    // 2. LUÔN LUÔN lưu vào LocalStorage (Dành cho cả Guest lẫn User)
    try {
      const localHistory = JSON.parse(localStorage.getItem("reading_history") || "{}");
      
      localHistory[storyId] = {
        chapterId,
        chapterSlug,
        updatedAt: new Date().getTime(),
      };

      localStorage.setItem("reading_history", JSON.stringify(localHistory));
    } catch (error) {
      console.error("Lỗi truy cập LocalStorage:", error);
    }
  }, [userId, storyId, chapterId, chapterSlug]);

  return null; // Component này không hiển thị gì cả, chỉ chạy ngầm
}