import { apiHandler, createOptionsHandler, parsePageParams, buildPagination, parseIntParam } from "@/lib/api-handler";
import { ChapterService } from "@/features/chapter/services/chapter.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx) => {
  ctx.cache(60); // Cache 60s
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const storySlug = searchParams.get("storySlug");
  const { page, limit } = parsePageParams(searchParams, { limit: 50 });

  if (!storyId && !storySlug) {
    throw ApiError.badRequest("Vui lòng cung cấp storyId hoặc storySlug", "ERR_MISSING_STORY_IDENTIFIER");
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
