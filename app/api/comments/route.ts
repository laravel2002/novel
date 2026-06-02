import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { getApiAuthUser } from "@/lib/api-auth";
import { CommentService } from "@/features/comment/services/comment.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const POST = apiHandler(async (req, ctx) => {
  const user = await getApiAuthUser(req);
  if (!user) {
    throw ApiError.unauthorized("Vui lòng đăng nhập để bình luận", "ERR_UNAUTHORIZED");
  }

  const body = await req.json();
  const { storyId, chapterId, paragraphId, content, isSpoiler } = body;

  if (!storyId || !content) {
    throw ApiError.badRequest("Thiếu storyId hoặc nội dung bình luận", "ERR_MISSING_FIELDS");
  }

  const comment = await CommentService.createComment({
    userId: user.id as string,
    storyId,
    chapterId,
    paragraphId,
    content,
    isSpoiler,
  });

  return ctx.success(comment, 201);
});
