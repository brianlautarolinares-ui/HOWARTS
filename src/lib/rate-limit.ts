import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const limiter = redisUrl && redisToken
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "campus:auth"
    })
  : null;

export async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  if (!limiter) return process.env.NODE_ENV !== "production";

  try {
    const result = await limiter.limit(identifier);
    return result.success;
  } catch (error: unknown) {
    console.error("auth_rate_limit_error", error);
    return process.env.NODE_ENV !== "production";
  }
}