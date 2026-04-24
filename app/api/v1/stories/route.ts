import { apiHandler, createOptionsHandler, parsePageParams, buildPagination, parseIntParam } from "@/lib/api-handler";
import { StoryService } from "@/features/story/services/story.service";
import { getApiAuthUser } from "@/lib/api-auth";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx) => {
  const { searchParams } = new URL(req.url);
  const { page, limit } = parsePageParams(searchParams);
  const status = searchParams.get("status") as "ONGOING" | "COMPLETED" | "PAUSED" | null;
  const orderBy = searchParams.get("orderBy") as "views" | "createdAt" | "votes" | null;
  const categoryId = parseIntParam(searchParams.get("categoryId"), 0) || undefined;

  // Gọi helper Auth đa nền tảng
  const user = await getApiAuthUser(req);
  if (user) {
    console.log(`[API v1/stories] User authenticated: ${user.email} (Role: ${user.role})`);
  }

  // Tương tác DB qua Service Layer
  const result = await StoryService.getStories({
    page,
    limit,
    status: status && ["ONGOING", "COMPLETED", "PAUSED"].includes(status) ? status : undefined,
    orderBy: orderBy && ["views", "createdAt", "votes"].includes(orderBy) ? orderBy : undefined,
    categoryId,
  });

  return ctx.paginated(
    result.stories,
    buildPagination(page, limit, result.total)
  );
});
