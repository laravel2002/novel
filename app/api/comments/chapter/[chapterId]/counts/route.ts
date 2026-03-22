import { NextResponse } from "next/server";
import { getParagraphCommentCounts } from "@/features/comment/services/comments";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  try {
    const { chapterId } = await params;

    const counts = await getParagraphCommentCounts(parseInt(chapterId, 10));

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Lỗi lấy số lượng bình luận theo đoạn:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
