import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, secret } = body;

    // Bảo mật: Webhooks của CMS/Admin sẽ gửi kèm secret key này
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json(
        { message: "Missing tag param" },
        { status: 400 },
      );
    }

    // @ts-ignore: Lỗi version type Next14
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 },
    );
  }
}
