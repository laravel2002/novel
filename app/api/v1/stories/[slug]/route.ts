import { apiHandler, createOptionsHandler } from "@/lib/api-handler";
import { StoryService } from "@/features/story/services/story.service";
import { ApiError } from "@/lib/api-error";

export const OPTIONS = createOptionsHandler();

export const GET = apiHandler(async (req, ctx, routeContext) => {
  ctx.cache(60); // Cache 60s
  const { slug } = await (routeContext as { params: Promise<{ slug: string }> }).params;

  const story = await StoryService.getStoryDetail(slug);

  if (!story) {
    throw ApiError.notFound("Không tìm thấy truyện", "ERR_STORY_NOT_FOUND");
  }

  return ctx.success(story);
});
