import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { ChapterService } from "@/features/chapter/services/chapter.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");
    const storySlug = searchParams.get("storySlug");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!storyId && !storySlug) {
      return sendError("Missing storyId or storySlug", "Vui lòng cung cấp storyId hoặc storySlug", 400);
    }

    const result = await ChapterService.getChapters({
      storyId: storyId ? parseInt(storyId, 10) : undefined,
      storySlug: storySlug || undefined,
      page,
      limit
    });

    const response = sendSuccess(
      result.chapters, 
      "Thành công", 
      200, 
      { 
        page, 
        limit, 
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    );
    
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy danh sách chương");
  }
}
