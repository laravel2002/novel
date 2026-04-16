import { apiHandler, createOptionsHandler, parsePageParams, buildPagination } from "@/lib/api-handler";
import { ChapterService } from "@/features/chapter/services/chapter.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  const { slug } = await (routeContext as { params: Promise<{ slug: string }> }).params;
  const { searchParams } = new URL(req.url);
  const { page, limit } = parsePageParams(searchParams, { limit: 100 });

  const result = await ChapterService.getChapters({
    storySlug: slug,
    page,
    limit,
  });

  return ctx.paginated(
    result.chapters,
    buildPagination(page, limit, result.total)
  );
});
