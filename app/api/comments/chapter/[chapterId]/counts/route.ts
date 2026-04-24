import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { CommentService } from "@/features/comment/services/comment.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (_req, ctx, routeContext) => {
  const { chapterId } = await (routeContext as { params: Promise<{ chapterId: string }> }).params;

  if (!chapterId) {
    return ctx.error("Thiếu chapterId", 400);
  }

  const counts = await CommentService.getParagraphCommentCounts(parseInt(chapterId, 10));

  return ctx.success(counts);
});
