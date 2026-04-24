import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export interface CreateCommentParams {
  userId: string;
  storyId: number;
  chapterId?: number;
  paragraphId?: number;
  content: string;
  isSpoiler?: boolean;
}

export interface GetCommentsParams {
  storyId?: number;
  chapterId?: number;
  paragraphId?: number;
  page?: number;
  limit?: number;
}

export const CommentService = {
  /**
   * Tạo bình luận mới
   */
  async createComment(params: CreateCommentParams) {
    const dataToSave = {
      ...params,
      content: params.content.normalize("NFC"),
      isSpoiler: params.isSpoiler || false,
    };

    const comment = await prisma.comment.create({
      data: dataToSave,
      include: {
        User: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      ...comment,
      userName: comment.User?.name || null,
      userImage: comment.User?.image || null,
    };
  },

  /**
   * Lấy danh sách bình luận (có phân trang)
   */
  async getComments(params: GetCommentsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const whereInput: Prisma.CommentWhereInput = {};

    if (params.chapterId) {
      whereInput.chapterId = params.chapterId;
      if (params.paragraphId !== undefined) {
        whereInput.paragraphId = params.paragraphId;
      }
    } else if (params.storyId) {
      whereInput.storyId = params.storyId;
      whereInput.chapterId = null; // Lấy comment của toàn bộ truyện (không thuộc chương nào)
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereInput,
        include: {
          User: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: whereInput })
    ]);

    return {
      comments: comments.map((cmd) => ({
        ...cmd,
        userName: cmd.User?.name || null,
        userImage: cmd.User?.image || null,
      })),
      total
    };
  },

  /**
   * Lấy số lượng bình luận theo từng đoạn văn trong chương
   */
  async getParagraphCommentCounts(chapterId: number) {
    const counts = await prisma.comment.groupBy({
      by: ["paragraphId"],
      where: {
        chapterId: chapterId,
        paragraphId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    return counts.reduce(
      (acc, curr) => {
        if (curr.paragraphId !== null) {
          acc[curr.paragraphId] = curr._count.id;
        }
        return acc;
      },
      {} as Record<number, number>,
    );
  }
};
