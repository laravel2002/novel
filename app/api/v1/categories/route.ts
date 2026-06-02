import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { CategoryService } from "@/features/story/services/story.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (_req, ctx) => {
  ctx.cache(86400); // Cache 1 ngày
  const categories = await CategoryService.getAllCategories();
  return ctx.success(categories);
});
