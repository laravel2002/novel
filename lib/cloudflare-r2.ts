import { AwsClient } from "aws4fetch";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

if (!accountId || !accessKeyId || !secretAccessKey || !R2_BUCKET_NAME) {
  console.warn(
    "⚠️ Cloudflare R2 credentials are not fully configured in environment variables.",
  );
}

export const r2Client = new AwsClient({
  accessKeyId: accessKeyId || "",
  secretAccessKey: secretAccessKey || "",
  service: "s3",
  region: "auto",
});

export const R2_URL = `https://${R2_BUCKET_NAME}.${accountId}.r2.cloudflarestorage.com`;
