import { AwsClient } from "aws4fetch";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Xóa dấu gạch chéo (/) ở cuối nếu lỡ tay gõ thừa trong file .env
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN?.replace(
  /\/$/,
  "",
);
export const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN?.replace(
  /\/$/,
  "",
);

if (!accountId || !accessKeyId || !secretAccessKey || !R2_BUCKET_NAME) {
  console.warn(
    "⚠️ Cloudflare R2 credentials are not fully configured in environment variables.",
  );
}

// Client dùng để gọi API (Upload, Xóa, hoặc Fetch có xác thực khi Public/Custom domain bị lỗi)
export const r2Client = new AwsClient({
  accessKeyId: accessKeyId || "",
  secretAccessKey: secretAccessKey || "",
  service: "s3",
  region: "auto",
});

// Endpoint gốc của Cloudflare R2
export const R2_URL = `https://${accountId}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}`;

/**
 * 🚀 TIỆN ÍCH: Lấy link tải truyện công khai
 * Ưu tiên số 1: Custom Domain (Ví dụ: cdn.novel.com/chuong-1.txt)
 * Ưu tiên số 2: Public Domain (Ví dụ: pub-xxx.r2.dev/chuong-1.txt)
 */
export function getPublicR2Url(fileKey: string): string | null {
  if (R2_CUSTOM_DOMAIN) {
    return `${R2_CUSTOM_DOMAIN}/${fileKey}`;
  }
  if (R2_PUBLIC_DOMAIN) {
    return `${R2_PUBLIC_DOMAIN}/${fileKey}`;
  }
  return null;
}
