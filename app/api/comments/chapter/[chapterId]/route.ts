import { NextResponse } from "next/server";
import { getComments } from "@/features/comment/services/comments";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  try {
    const { chapterId } = await params;
    const { searchParams } = new URL(req.url);
    const paragraphIdParam = searchParams.get("paragraphId");

    // Khả năng tương thích kiểu cũ (FastAPI)
    const paraId = paragraphIdParam || searchParams.get("paragraph_id");

    const paragraphId = paraId !== null ? parseInt(paraId, 10) : undefined;

    const comments = await getComments(parseInt(chapterId, 10), paragraphId);

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Lỗi lấy bình luận:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
