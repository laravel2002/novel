import { prisma } from "@/lib/prisma";

export async function createComment(data: {
  userId: string;
  storyId: number;
  chapterId?: number;
  paragraphId?: number;
  content: string;
  isSpoiler: boolean;
}) {
  const dataToSave = {
    ...data,
    content: data.content ? data.content.normalize("NFC") : data.content,
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
}

export async function getComments(chapterId: number, paragraphId?: number) {
  const comments = await prisma.comment.findMany({
    where: {
      chapterId: chapterId,
      ...(paragraphId !== undefined ? { paragraphId } : {}),
    },
    include: {
      User: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return comments.map((cmd) => ({
    ...cmd,
    userName: cmd.User?.name || null,
    userImage: cmd.User?.image || null,
  }));
}

export async function getParagraphCommentCounts(chapterId: number) {
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
