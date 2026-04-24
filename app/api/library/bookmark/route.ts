import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { getApiAuthUser } from "@/lib/api-auth";
import { LibraryService } from "@/features/library/services/library.service";

export const OPTIONS = createOptionsHandler();

export const POST = apiHandler(async (req, ctx) => {
  const user = await getApiAuthUser(req);
  if (!user) {
    return ctx.error("Vui lòng đăng nhập để lưu truyện", 401);
  }

  const body = await req.json();
  const { storyId } = body;

  if (!storyId || typeof storyId !== "number") {
    return ctx.error("Thiếu hoặc sai định dạng storyId", 400);
  }

  const result = await LibraryService.toggleBookmark(user.id as string, storyId);

  return ctx.success(
    result,
    200
  );
});
