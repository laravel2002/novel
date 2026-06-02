import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { getApiAuthUser } from "@/lib/api-auth";
import { LibraryService } from "@/features/library/services/library.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const POST = apiHandler(async (req, ctx) => {
  const user = await getApiAuthUser(req);
  if (!user) {
    throw ApiError.unauthorized("Vui lòng đăng nhập để lưu truyện", "ERR_UNAUTHORIZED");
  }

  const body = await req.json();
  const { storyId } = body;

  if (!storyId || typeof storyId !== "number") {
    throw ApiError.badRequest("Thiếu hoặc sai định dạng storyId", "ERR_INVALID_STORY_ID");
  }

  const result = await LibraryService.toggleBookmark(user.id as string, storyId);

  return ctx.success(
    result,
    200
  );
});
