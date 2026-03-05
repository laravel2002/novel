"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type CommentResult = {
  id: number;
  content: string;
  isSpoiler: boolean;
  createdAt: Date;
  User: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
};

export async function createComment(data: {
  storyId: number;
  chapterId: number;
  content: string;
  isSpoiler: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Bạn phải đăng nhập để bình luận." };
    }

    if (!data.content || data.content.trim() === "") {
      return {
        success: false,
        error: "Nội dung bình luận không được để trống.",
      };
    }

    if (data.content.length > 1000) {
      return {
        success: false,
        error: "Bình luận quá dài (tối đa 1000 ký tự).",
      };
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        storyId: data.storyId,
        chapterId: data.chapterId,
        content: data.content.trim(),
        isSpoiler: data.isSpoiler,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // We don't hardcode revalidatePath here because chapter slug needs to be fetched,
    // we'll let the client handle router.refresh() or manual state update instead for faster feedback.

    return { success: true, comment: comment as CommentResult };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Đã có lỗi xảy ra khi gửi bình luận." };
  }
}

export async function getChapterComments(
  chapterId: number,
  page: number = 1,
  limit: number = 20,
) {
  try {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { chapterId },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Newest first
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { chapterId } }),
    ]);

    return {
      success: true,
      comments: comments as CommentResult[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: "Không thể lấy danh sách bình luận",
      comments: [],
    };
  }
}

export async function deleteComment(commentId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Bình luận không tồn tại." };
    }

    // Only owner or admin can delete
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Không có quyền xóa bình luận này." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Lỗi xóa bình luận." };
  }
}
