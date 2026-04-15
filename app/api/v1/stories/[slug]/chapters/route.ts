import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { ChapterService } from "@/features/chapter/services/chapter.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const result = await ChapterService.getChapters({
      storySlug: slug,
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
        totalPages: Math.ceil(result.total / limit),
      }
    );

    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, String(value));
    }

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy danh sách chương của truyện (v1)");
  }
}
