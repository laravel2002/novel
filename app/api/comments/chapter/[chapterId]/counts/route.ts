import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { CommentService } from "@/features/comment/services/comment.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  try {
    const { chapterId } = await params;
    
    if (!chapterId) {
      return sendError("Missing chapterId", "Thiếu chapterId", 400);
    }

    const counts = await CommentService.getParagraphCommentCounts(parseInt(chapterId, 10));

    const response = sendSuccess(counts, "Thành công");
    
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy số lượng bình luận theo đoạn");
  }
}
