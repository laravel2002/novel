import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { getApiAuthUser } from "@/lib/api-auth";
import { LibraryService } from "@/features/library/services/library.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const user = await getApiAuthUser(req);
    if (!user) {
      return sendError("Unauthorized", "Vui lòng đăng nhập để lưu truyện", 401);
    }

    const body = await req.json();
    const { storyId } = body;

    if (!storyId || typeof storyId !== "number") {
      return sendError("Invalid storyId", "Thiếu hoặc sai định dạng storyId", 400);
    }

    const result = await LibraryService.toggleBookmark(user.id as string, storyId);

    const response = sendSuccess(result, result.bookmarked ? "Đã lưu vào tủ truyện" : "Đã xoá khỏi tủ truyện");
    
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi xử lý đánh dấu truyện");
  }
}
