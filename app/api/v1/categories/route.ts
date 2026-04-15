import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/api-response";
import { CategoryService } from "@/features/story/services/story.service";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const categories = await CategoryService.getAllCategories();
    
    const response = sendSuccess(categories, "Thành công");

    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return sendError(error, "Lỗi khi lấy danh sách thể loại");
  }
}
