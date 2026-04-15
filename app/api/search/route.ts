import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { SearchService } from "@/features/search/services/search.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query.trim()) {
      return sendSuccess([], "Nhập từ khóa tìm kiếm", 200, { page, limit, total: 0, totalPages: 0 });
    }

    const result = await SearchService.search({
      query,
      page,
      limit
    });

    const response = sendSuccess(
      result.stories,
      "Thành công",
      200,
      {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    );

    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi tìm kiếm truyện");
  }
}
