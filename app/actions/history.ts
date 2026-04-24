"use server";

import { prisma } from "@/lib/prisma";

export async function saveReadingProgress(
  userId: string | undefined,
  storyId: number,
  chapterId: number,
  scrollPercentage: number = 0,
) {
  // Nếu chưa đăng nhập, bỏ qua việc lưu DB (sẽ xử lý ở LocalStorage dưới Client)
  if (!userId) return { success: false, message: "Guest user" };

  try {
    // Kiểm tra xem User có tồn tại không để tránh lỗi Foreign Key (P2003) do Session cũ bị lệch
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.warn(`[History] Bỏ qua lưu lịch sử. Không tìm thấy User ID: ${userId} trong DB`);
      return { success: false, message: "User không tồn tại trong DB (Có thể do DB bị wipe)" };
    }
    await prisma.readingHistory.upsert({
      where: {
        // Sử dụng index @@unique([userId, storyId]) trong schema của bạn
        userId_storyId: {
          userId: userId,
          storyId: storyId,
        },
      },
      update: {
        chapterId: chapterId,
        scrollPercentage: scrollPercentage,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        storyId: storyId,
        chapterId: chapterId,
        scrollPercentage: scrollPercentage,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[DB ERROR] Lỗi lưu lịch sử đọc:", error);
    return { success: false, error: "Lỗi cơ sở dữ liệu" };
  }
}
