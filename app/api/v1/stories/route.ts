import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { StoryService } from "@/features/story/services/story.service";
import { getApiAuthUser } from "@/lib/api-auth";
import { corsHeaders, handleOptions } from "../cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") as any;
    const orderBy = searchParams.get("orderBy") as any;
    const categoryIdParam = searchParams.get("categoryId");
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;

    // Gọi helper Auth đa nền tảng (Step 4)
    const user = await getApiAuthUser(req);
    if (user) {
      console.log(`[API v1/stories] User authenticated: ${user.email} (Role: ${user.role})`);
    }

    // Tương tác với DB qua Service Layer (Step 2)
    const result = await StoryService.getStories({
      page,
      limit,
      status: ["ONGOING", "COMPLETED", "PAUSED"].includes(status) ? status : undefined,
      orderBy: ["views", "createdAt", "votes"].includes(orderBy) ? orderBy : undefined,
      categoryId: !isNaN(categoryId as number) ? categoryId : undefined,
    });

    const totalPages = Math.ceil(result.total / limit);

    // Trả kết quả chuẩn hóa API Response Formatter (Step 1)
    const response = sendSuccess(
      result.stories,
      "Thành công",
      200,
      {
        page,
        limit,
        total: result.total,
        totalPages,
        hasMore: page < totalPages,
      }
    );

    // Map Headers thủ công
    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, String(value));
    }
    
    return response;
  } catch (error) {
    console.error("[API v1/stories] Error:", error);
    const errResponse = sendError(error, "Lấy danh sách truyện thất bại");
    for (const [key, value] of Object.entries(corsHeaders())) {
      errResponse.headers.set(key, String(value));
    }
    return errResponse;
  }
}
