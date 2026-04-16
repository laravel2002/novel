import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getChapterContent } from "./storage";

export interface GetChaptersParams {
  storyId?: number;
  storySlug?: string;
  page?: number;
  limit?: number;
}

export interface GetChaptersResult {
  chapters: Prisma.ChapterGetPayload<{
    select: {
      id: true;
      chapterNum: true;
      title: true;
      createdAt: true;
    }
  }>[];
  total: number;
}

export const ChapterService = {
  /**
   * Lấy danh sách chương của một truyện (có phân trang)
   */
  async getChapters(params: GetChaptersParams): Promise<GetChaptersResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 50;
    const skip = (page - 1) * limit;

    const whereInput: Prisma.ChapterWhereInput = {};

    if (params.storyId) {
      whereInput.storyId = params.storyId;
    } else if (params.storySlug) {
      whereInput.Story = { slug: params.storySlug };
    } else {
      throw new Error("storyId or storySlug is required");
    }

    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where: whereInput,
        orderBy: { chapterNum: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          chapterNum: true,
          title: true,
          createdAt: true,
        }
      }),
      prisma.chapter.count({ where: whereInput })
    ]);

    return { chapters, total };
  },

  /**
   * Lấy chi tiết nội dung một chương
   */
  async getChapterDetail(chapterId: number) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        Story: {
          select: { title: true, slug: true, id: true }
        }
      }
    });

    if (!chapter) return null;

    // Lấy nội dung từ R2 hoặc DB
    let content = "";
    if (chapter.cloudflarer2Key) {
      content = (await getChapterContent(chapter.cloudflarer2Key)) || "";
    } else {
      content = chapter.content || "";
    }

    // Lấy ID chương trước/sau
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapter.findFirst({
        where: {
          storyId: chapter.storyId,
          chapterNum: { lt: chapter.chapterNum },
        },
        orderBy: { chapterNum: "desc" },
        select: { id: true, chapterNum: true, title: true }
      }),
      prisma.chapter.findFirst({
        where: {
          storyId: chapter.storyId,
          chapterNum: { gt: chapter.chapterNum },
        },
        orderBy: { chapterNum: "asc" },
        select: { id: true, chapterNum: true, title: true }
      })
    ]);

    return {
      ...chapter,
      content,
      prevChapter,
      nextChapter
    };
  },

  /**
   * Lấy chi tiết chương với format dành riêng cho Mobile App.
   * Trả về cấu trúc gọn nhẹ: chapterInfo, content, nextChapterId, prevChapterId.
   */
  async getChapterDetailForMobile(chapterId: number) {
    const chapter = await this.getChapterDetail(chapterId);
    if (!chapter) return null;

    return {
      chapterInfo: {
        id: chapter.id,
        chapterNumber: chapter.chapterNum,
        title: chapter.title,
        storyTitle: chapter.Story.title,
        storySlug: chapter.Story.slug,
        createdAt: chapter.createdAt,
      },
      content: chapter.content,
      nextChapterId: chapter.nextChapter?.id ?? null,
      prevChapterId: chapter.prevChapter?.id ?? null,
    };
  }
};
