import { NextRequest, NextResponse } from "next/server";
import { searchStories } from "@/features/story/services/story";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const result = await searchStories(query, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
