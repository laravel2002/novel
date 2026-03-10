"use server";

import { prisma } from "@/lib/prisma";
import { recordStoryView } from "@/services/leaderboard";

export async function trackChapterView(storyId: number, chapterId: number) {
  try {
    // Tăng lượt xem cho chapter
    void prisma.chapter
      .update({
        where: { id: chapterId },
        data: { views: { increment: 1 } },
        select: { id: true },
      })
      .catch(() => {});

    // Tăng lượt xem cho story
    void prisma.story
      .update({
        where: { id: storyId },
        data: { views: { increment: 1 } },
        select: { id: true },
      })
      .catch(() => {});

    // Tăng lượt xem trong Redis Leaderboard
    void recordStoryView(storyId).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi track view:", error);
    return { success: false };
  }
}
