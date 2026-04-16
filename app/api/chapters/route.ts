import { apiHandler, createOptionsHandler, parsePageParams, buildPagination, parseIntParam } from "@/lib/api-handler";
import { ChapterService } from "@/features/chapter/services/chapter.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const storySlug = searchParams.get("storySlug");
  const { page, limit } = parsePageParams(searchParams, { limit: 50 });

  if (!storyId && !storySlug) {
    return ctx.error("Vui lòng cung cấp storyId hoặc storySlug", 400);
  }

  const result = await ChapterService.getChapters({
    storyId: storyId ? parseIntParam(storyId, 0) || undefined : undefined,
    storySlug: storySlug || undefined,
    page,
    limit,
  });

  return ctx.paginated(
    result.chapters,
    buildPagination(page, limit, result.total)
  );
});
