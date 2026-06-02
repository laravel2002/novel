import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { ChapterService } from "@/features/chapter/services/chapter.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  ctx.cache(3600); // Cache 1 giờ cho nội dung chương
  const { chapterId: rawId } = await (routeContext as { params: Promise<{ chapterId: string }> }).params;
  const chapterId = parseInt(rawId, 10);

  if (isNaN(chapterId)) {
    throw ApiError.badRequest("ID chương không hợp lệ", "ERR_INVALID_CHAPTER_ID");
  }

  // Dùng method format chuyên cho Mobile (đã chuyển logic mapping vào service)
  const data = await ChapterService.getChapterDetailForMobile(chapterId);

  if (!data) {
    throw ApiError.notFound("Không tìm thấy chương", "ERR_CHAPTER_NOT_FOUND");
  }

  return ctx.success(data);
});
