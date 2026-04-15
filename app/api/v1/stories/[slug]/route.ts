import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { StoryService } from "@/features/story/services/story.service";
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
    
    const story = await StoryService.getStoryDetail(slug);

    if (!story) {
      return sendError("Not Found", "Không tìm thấy truyện", 404);
    }

    const response = sendSuccess(story, "Thành công");

    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, String(value));
    }

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy chi tiết truyện (v1)");
  }
}
