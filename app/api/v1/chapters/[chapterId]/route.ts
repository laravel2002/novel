import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChapterContent } from "@/features/chapter/services/storage";
import { corsHeaders, handleOptions } from "../../cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  try {
    const { chapterId: rawChapterId } = await params;
    const chapterId = parseInt(rawChapterId, 10);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { success: false, error: "Invalid chapter ID" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        Story: {
          select: { title: true, slug: true },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404, headers: corsHeaders() },
      );
    }

    // Lấy nội dung từ Cloudflare R2 nếu có, nếu không thì lấy dự phòng từ DB
    let content = "";
    if (chapter.cloudflarer2Key) {
      const r2Content = await getChapterContent(chapter.cloudflarer2Key);
      content = r2Content || "";
    } else if (chapter.content) {
      content = chapter.content;
    }

    // Lấy ID của chương trước và chương sau bằng Promise.all (Tối ưu tốc độ)
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapter.findFirst({
        where: {
          storyId: chapter.storyId,
          chapterNum: { lt: chapter.chapterNum },
        },
        orderBy: { chapterNum: "desc" },
        select: { id: true },
      }),
      prisma.chapter.findFirst({
        where: {
          storyId: chapter.storyId,
          chapterNum: { gt: chapter.chapterNum },
        },
        orderBy: { chapterNum: "asc" },
        select: { id: true },
      }),
    ]);

    const chapterInfo = {
      id: chapter.id,
      chapterNumber: chapter.chapterNum,
      title: chapter.title,
      storyTitle: chapter.Story.title,
      storySlug: chapter.Story.slug,
      createdAt: chapter.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          chapterInfo,
          content,
          nextChapterId: nextChapter?.id || null,
          prevChapterId: prevChapter?.id || null,
        },
      },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/chapters/[chapterId]:`, error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
