import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { CommentService } from "@/features/comment/services/comment.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (_req, ctx, routeContext) => {
  ctx.cache(60); // Cache 60s
  const { chapterId } = await (routeContext as { params: Promise<{ chapterId: string }> }).params;

  if (!chapterId) {
    throw ApiError.badRequest("Thiếu chapterId", "ERR_MISSING_CHAPTER_ID");
  }

  const counts = await CommentService.getParagraphCommentCounts(parseInt(chapterId, 10));

  return ctx.success(counts);
});
