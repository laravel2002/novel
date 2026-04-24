import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { getApiAuthUser } from "@/lib/api-auth";
import { CommentService } from "@/features/comment/services/comment.service";

export const OPTIONS = createOptionsHandler();

export const POST = apiHandler(async (req, ctx) => {
  const user = await getApiAuthUser(req);
  if (!user) {
    return ctx.error("Vui lòng đăng nhập để bình luận", 401);
  }

  const body = await req.json();
  const { storyId, chapterId, paragraphId, content, isSpoiler } = body;

  if (!storyId || !content) {
    return ctx.error("Thiếu storyId hoặc nội dung bình luận", 400);
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
