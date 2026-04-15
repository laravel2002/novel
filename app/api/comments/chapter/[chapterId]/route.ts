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
    const { searchParams } = new URL(req.url);
    const paragraphIdStr = searchParams.get("paragraphId") || searchParams.get("paragraph_id");
    const paragraphId = paragraphIdStr ? parseInt(paragraphIdStr, 10) : undefined;
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await CommentService.getComments({
      chapterId: parseInt(chapterId, 10),
      paragraphId: isNaN(paragraphId as number) ? undefined : paragraphId,
      page,
      limit
    });

    const response = sendSuccess(
      result.comments, 
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
    return sendError(error, "Lỗi khi lấy danh sách bình luận");
  }
}
