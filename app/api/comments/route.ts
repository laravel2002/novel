import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { getApiAuthUser } from "@/lib/api-auth";
import { CommentService } from "@/features/comment/services/comment.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const user = await getApiAuthUser(req);
    if (!user) {
      return sendError("Unauthorized", "Vui lòng đăng nhập để bình luận", 401);
    }

    const body = await req.json();
    const { storyId, chapterId, paragraphId, content, isSpoiler } = body;

    if (!storyId || !content) {
      return sendError("Missing fields", "Thiếu storyId hoặc nội dung bình luận", 400);
    }

    const comment = await CommentService.createComment({
      userId: user.id as string,
      storyId,
      chapterId,
      paragraphId,
      content,
      isSpoiler,
    });

    const response = sendSuccess(comment, "Đã gửi bình luận", 201);
    
    // Thêm CORS headers
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi tạo bình luận");
  }
}
