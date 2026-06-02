import { apiHandler } from "@/lib/api-handler";
import { revalidateTag } from "next/cache";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req, ctx) => {
  const body = await req.json();
  const { tag, secret } = body;

  // Bảo mật: Webhooks của CMS/Admin sẽ gửi kèm secret key này
  if (secret !== process.env.REVALIDATE_SECRET) {
    throw ApiError.unauthorized("Invalid secret", "ERR_INVALID_SECRET");
  }

  if (!tag) {
    throw ApiError.badRequest("Missing tag param", "ERR_MISSING_TAG");
  }

  await revalidateTag(tag, "default");

  return ctx.success({ revalidated: true, tag, now: Date.now() });
}, { cors: false });
