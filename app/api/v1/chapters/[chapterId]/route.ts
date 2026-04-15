import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { ChapterService } from "@/features/chapter/services/chapter.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  try {
    const { chapterId: rawId } = await params;
    const chapterId = parseInt(rawId, 10);

    if (isNaN(chapterId)) {
      return sendError("Invalid ID", "ID chương không hợp lệ", 400);
    }

    const chapter = await ChapterService.getChapterDetail(chapterId);

    if (!chapter) {
      return sendError("Not Found", "Không tìm thấy chương", 404);
    }

    // Formatting data for Mobile
    const data = {
      chapterInfo: {
        id: chapter.id,
        chapterNumber: chapter.chapterNum,
        title: chapter.title,
        storyTitle: chapter.Story.title,
        storySlug: chapter.Story.slug,
        createdAt: chapter.createdAt,
      },
      content: chapter.content,
      nextChapterId: chapter.nextChapter?.id || null,
      prevChapterId: chapter.prevChapter?.id || null,
    };

    const response = sendSuccess(data, "Thành công");

    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy chi tiết chương");
  }
}
