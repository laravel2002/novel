import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleBookmark } from "@/services/library";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storyId } = body;

    if (!storyId || typeof storyId !== "number") {
      return NextResponse.json({ error: "Invalid storyId" }, { status: 400 });
    }

    const result = await toggleBookmark(session.user.id, storyId);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[TOGGLE_BOOKMARK_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
