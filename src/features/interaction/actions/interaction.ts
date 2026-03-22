"use server";

import { auth } from "@/lib/auth/auth";
import { upsertRating, createNomination } from "@/features/interaction/services/interaction";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Đánh giá truyện (1-5 sao)
 */
export async function rateStoryAction(storyId: number, score: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Vui lòng đăng nhập để đánh giá truyện",
    };
  }

  const result = await upsertRating(session.user.id, storyId, score);

  if (result.success) {
    // Revalidate toàn bộ vì rating hiển thị ở nhiều trang (trang chủ, BXH, danh sách...)
    revalidatePath("/", "layout");
  }

  return result;
}

/**
 * Server Action: Đề cử truyện
 */
export async function nominateStoryAction(storyId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Vui lòng đăng nhập để đề cử truyện",
    };
  }

  const result = await createNomination(session.user.id, storyId);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
