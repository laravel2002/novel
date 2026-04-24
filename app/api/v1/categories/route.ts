import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { CategoryService } from "@/features/story/services/story.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (_req, ctx) => {
  const categories = await CategoryService.getAllCategories();
  return ctx.success(categories);
});
