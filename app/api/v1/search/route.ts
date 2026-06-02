import { apiHandler, createOptionsHandler, parsePageParams, buildPagination } from "@/lib/api-handler";
import { SearchService } from "@/features/search/services/search.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx) => {
  ctx.cache(60); // Cache 60s
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const { page, limit } = parsePageParams(searchParams);

  if (!query.trim()) {
    return ctx.paginated([], buildPagination(page, limit, 0));
  }

  // Dùng method format chuyên cho Mobile (coverUrl → coverImage)
  const result = await SearchService.searchForMobile({
    query,
    page,
    limit,
  });

  return ctx.paginated(
    result.stories,
    buildPagination(page, limit, result.total)
  );
});
