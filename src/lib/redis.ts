import { Redis } from "@upstash/redis";

// Nếu chưa có env cho Upstash, ta sẽ fallback an toàn để app không bị crash.
// Trong môi trường Production, bắt buộc phải có UPSTASH_REDIS_REST_URL
let redisClient: Redis | null = null;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("✅ Upstash Redis Inititalized");
  } else {
    console.warn(
      "⚠️ Missing Upstash Redis configurations. Leaderboards will use fallback.",
    );
  }
} catch (error) {
  console.error("❌ Failed to initialize Upstash Redis:", error);
}

export const redis = redisClient;
