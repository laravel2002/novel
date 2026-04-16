import { apiHandler } from "@/lib/api-handler";
import { revalidateTag } from "next/cache";

export const POST = apiHandler(async (req, ctx) => {
  const body = await req.json();
  const { tag, secret } = body;

  // Bảo mật: Webhooks của CMS/Admin sẽ gửi kèm secret key này
  if (secret !== process.env.REVALIDATE_SECRET) {
    return ctx.error("Invalid secret", 401);
  }

  if (!tag) {
    return ctx.error("Missing tag param", 400);
  }

  await revalidateTag(tag, "default");

  return ctx.success({ revalidated: true, tag, now: Date.now() });
}, { cors: false });
