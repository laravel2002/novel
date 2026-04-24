import { prisma } from "@/lib/prisma";

// ========================
// RATING - Đánh giá truyện
// ========================

/**
 * Tạo hoặc cập nhật đánh giá của user cho truyện.
 * Sau khi upsert, tính lại điểm trung bình story.rating trong transaction.
 */
export async function upsertRating(
  userId: string,
  storyId: number,
  score: number,
): Promise<
  { success: true; newAvgRating: number } | { success: false; error: string }
> {
  // Validate score 1-5
  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    return {
      success: false as const,
      error: "Điểm đánh giá phải là số nguyên từ 1 đến 5",
    };
  }

  try {
    // Sử dụng transaction để đảm bảo tính nhất quán
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert rating
      await tx.rating.upsert({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
        update: { score },
        create: {
          userId,
          storyId,
          score,
        },
      });

      // 2. Tính lại trung bình
      const aggregate = await tx.rating.aggregate({
        where: { storyId },
        _avg: { score: true },
      });

      const newAvgRating = Math.round((aggregate._avg.score ?? 0) * 10) / 10;

      // 3. Cập nhật story.rating
      await tx.story.update({
        where: { id: storyId },
        data: { rating: newAvgRating },
      });

      return newAvgRating;
    });

    return { success: true as const, newAvgRating: result };
  } catch (error) {
    console.error("[Interaction] Lỗi upsert rating:", error);
    return {
      success: false as const,
      error: "Đã xảy ra lỗi khi đánh giá, vui lòng thử lại",
    };
  }
}

/**
 * Lấy rating hiện tại của user cho truyện (null nếu chưa đánh giá).
 */
export async function getUserRating(
  userId: string,
  storyId: number,
): Promise<number | null> {
  const rating = await prisma.rating.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
    select: { score: true },
  });

  return rating?.score ?? null;
}

// ============================
// NOMINATION - Đề cử truyện
// ============================

const DAILY_NOMINATION_LIMIT = 3; // Tối đa 3 phiếu đề cử / user / ngày

/**
 * Tạo đề cử cho truyện.
 * Giới hạn: 1 lượt/user/truyện/ngày VÀ tối đa 3 phiếu/user/ngày (toàn bộ truyện).
 */
export async function createNomination(
  userId: string,
  storyId: number,
): Promise<
  | { success: true; totalNominations: number; remainingToday: number }
  | { success: false; error: string }
> {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize về đầu ngày UTC

    // Kiểm tra đã đề cử truyện này hôm nay chưa
    const existing = await prisma.nomination.findUnique({
      where: {
        userId_storyId_date: {
          userId,
          storyId,
          date: today,
        },
      },
    });

    if (existing) {
      return {
        success: false as const,
        error: "Bạn đã đề cử truyện này hôm nay rồi",
      };
    }

    // Kiểm tra tổng số phiếu đã dùng hôm nay (tất cả truyện)
    const usedToday = await prisma.nomination.count({
      where: {
        userId,
        date: today,
      },
    });

    if (usedToday >= DAILY_NOMINATION_LIMIT) {
      return {
        success: false as const,
        error: `Bạn đã dùng hết ${DAILY_NOMINATION_LIMIT} phiếu đề cử hôm nay`,
      };
    }

    // Tạo nomination mới
    await prisma.nomination.create({
      data: {
        userId,
        storyId,
        date: today,
      },
    });

    // Đếm tổng nominations
    const totalNominations = await prisma.nomination.count({
      where: { storyId },
    });

    return {
      success: true as const,
      totalNominations,
      remainingToday: DAILY_NOMINATION_LIMIT - usedToday - 1,
    };
  } catch (error) {
    console.error("[Interaction] Lỗi tạo nomination:", error);
    return {
      success: false as const,
      error: "Đã xảy ra lỗi khi đề cử, vui lòng thử lại",
    };
  }
}

/**
 * Kiểm tra user đã đề cử truyện hôm nay chưa.
 */
export async function hasNominatedToday(
  userId: string,
  storyId: number,
): Promise<boolean> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.nomination.findUnique({
    where: {
      userId_storyId_date: {
        userId,
        storyId,
        date: today,
      },
    },
  });

  return !!existing;
}

/**
 * Đếm tổng lượt đề cử cho truyện (tất cả user, tất cả ngày).
 */
export async function getNominationCount(storyId: number): Promise<number> {
  return await prisma.nomination.count({
    where: { storyId },
  });
}

/**
 * Lấy số phiếu đề cử còn lại của user hôm nay.
 */
export async function getRemainingNominations(userId: string): Promise<number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const usedToday = await prisma.nomination.count({
    where: {
      userId,
      date: today,
    },
  });

  return Math.max(0, DAILY_NOMINATION_LIMIT - usedToday);
}
