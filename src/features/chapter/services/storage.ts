import { r2Client, R2_URL, R2_PUBLIC_DOMAIN } from "@/lib/cloudflare-r2";

/**
 * Uploads chapter content to Cloudflare R2 using aws4fetch
 * @param key The path/key in the bucket (e.g., "stories/slug-truyen/chapters/1.html")
 * @param content The text/html content to upload
 * @param contentType The MIME type (default: "text/html")
 * @returns boolean indicating success
 */
export async function uploadChapterContent(
  key: string,
  content: string,
  contentType: string = "text/html",
): Promise<boolean> {
  if (!R2_URL) {
    console.error("R2_URL is not configured.");
    return false;
  }

  try {
    const url = `${R2_URL}/${key}`;
    const response = await r2Client.fetch(url, {
      method: "PUT",
      body: content,
      headers: {
        "Content-Type": contentType,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to upload to R2: ${response.status} ${response.statusText}`,
      );
      const text = await response.text();
      console.error("R2 Error response:", text);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return false;
  }
}

/**
 * Fetches chapter content from Cloudflare R2
 * Assumes the bucket is public and mapped to R2_PUBLIC_DOMAIN for performance.
 * Fallbacks to authenticated fetch if domain is not configured.
 * @param key The path/key in the bucket
 * @returns The text/html content or null if failed
 */
export async function getChapterContent(key: string): Promise<string | null> {
  // 1. Ưu tiên lấy qua Public Domain (Rẻ, nhanh, cache tốt qua CDN)
  if (R2_PUBLIC_DOMAIN) {
    try {
      const url = `${R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${key}`;
      const response = await fetch(url, {
        next: { revalidate: 3600 }, // Cache on Next.js side
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch from R2 public domain: ${response.statusText}`,
        );
      }

      return await response.text();
    } catch (error) {
      console.error(
        "Error fetching from R2 public domain, falling back to authenticated fetch:",
        error,
      );
      // Fall down to authenticated fetch
    }
  }

  // 2. Fallback: Lấy qua private authenticated fetch (aws4fetch)
  if (!R2_URL) {
    console.error("R2_URL is not configured for fallback fetch.");
    return null;
  }

  try {
    const url = `${R2_URL}/${key}`;
    const response = await r2Client.fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch from R2: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching from R2 via aws4fetch:", error);
    return null;
  }
}
