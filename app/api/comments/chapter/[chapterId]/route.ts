import { apiHandler, createOptionsHandler, parsePageParams, buildPagination, parseIntParam } from "@/lib/api-handler";
import { CommentService } from "@/features/comment/services/comment.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  const { chapterId } = await (routeContext as { params: Promise<{ chapterId: string }> }).params;
  const { searchParams } = new URL(req.url);
  const paragraphIdStr = searchParams.get("paragraphId") || searchParams.get("paragraph_id");
  const paragraphId = paragraphIdStr ? parseIntParam(paragraphIdStr, 0) || undefined : undefined;
  const { page, limit } = parsePageParams(searchParams, { limit: 50 });

  const result = await CommentService.getComments({
    chapterId: parseInt(chapterId, 10),
    paragraphId,
    page,
    limit,
  });

  return ctx.paginated(
    result.comments,
    buildPagination(page, limit, result.total)
  );
});
