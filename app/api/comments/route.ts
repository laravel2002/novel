import { NextResponse } from "next/server";
import { createComment } from "@/services/comments";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Bắt buộc xác thực người dùng từ session server cho an toàn
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storyId, chapterId, paragraphId, content, isSpoiler } = body;

    const comment = await createComment({
      userId: session.user.id,
      storyId,
      chapterId,
      paragraphId,
      content,
      isSpoiler: isSpoiler || false,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Lỗi tạo bình luận:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
