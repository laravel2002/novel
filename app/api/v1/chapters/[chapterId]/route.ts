import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { ChapterService } from "@/features/chapter/services/chapter.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  const { chapterId: rawId } = await (routeContext as { params: Promise<{ chapterId: string }> }).params;
  const chapterId = parseInt(rawId, 10);

  if (isNaN(chapterId)) {
    return ctx.error("ID chương không hợp lệ", 400);
  }

  // Dùng method format chuyên cho Mobile (đã chuyển logic mapping vào service)
  const data = await ChapterService.getChapterDetailForMobile(chapterId);

  if (!data) {
    return ctx.error("Không tìm thấy chương", 404);
  }

  return ctx.success(data);
});
