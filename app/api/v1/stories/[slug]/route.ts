import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { StoryService } from "@/features/story/services/story.service";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  const { slug } = await (routeContext as { params: Promise<{ slug: string }> }).params;

  const story = await StoryService.getStoryDetail(slug);

  if (!story) {
    return ctx.error("Không tìm thấy truyện", 404);
  }

  return ctx.success(story);
});
