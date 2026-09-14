import type { NextRequest } from "next/server";

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// Sliding window rate limiter for Next.js API routes.
// Supports Upstash Redis REST when configured, with an in-memory Map fallback.

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store: Map<key, timestamp[]>
const memoryStore = new Map<string, number[]>();

// Cleanup stale timestamps periodically without keeping Node event loop alive
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of memoryStore.entries()) {
    const valid = timestamps.filter((t) => now - t < 300_000); // 5 min max window
    if (valid.length === 0) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, valid);
    }
  }
}, 60_000);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    process.env.UPSTASH_REDIS_REST_URL.startsWith("http")
  );
}

/**
 * Check and record a request against rate limits.
 */
export async function checkRateLimit(
  req: NextRequest,
  action: "execute" | "parse" | "analyze",
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const defaults: Record<string, RateLimitConfig> = {
    execute: { maxRequests: 15, windowSeconds: 60 },
    parse: { maxRequests: 10, windowSeconds: 60 },
    analyze: { maxRequests: 10, windowSeconds: 60 },
  };

  const { maxRequests, windowSeconds } = config ?? defaults[action] ?? { maxRequests: 20, windowSeconds: 60 };
  const clientIp = getClientIdentifier(req);
  const key = `ratelimit:${action}:${clientIp}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // 1. Upstash Redis if configured
  if (isUpstashConfigured()) {
    try {
      // Use Redis sorted set or incr key
      const currentBlock = Math.floor(now / windowMs);
      const redisKey = `${key}:${currentBlock}`;
      const url = `${process.env.UPSTASH_REDIS_REST_URL}/incr/${redisKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      });

      if (res.ok) {
        const data = (await res.json()) as { result: number };
        const currentCount = data.result;

        // If first hit in block, set expiry
        if (currentCount === 1) {
          await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/expire/${redisKey}/${windowSeconds * 2}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          }).catch(() => {});
        }

        const remaining = Math.max(0, maxRequests - currentCount);
        const reset = Math.ceil((windowMs - (now % windowMs)) / 1000);

        return {
          success: currentCount <= maxRequests,
          limit: maxRequests,
          remaining,
          reset,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limit error, using in-memory:", err);
    }
  }

  // 2. In-memory sliding window fallback
  const windowStart = now - windowMs;
  const timestamps = (memoryStore.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    const oldestTimestamp = timestamps[0];
    const reset = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);

  const remaining = maxRequests - timestamps.length;
  const reset = windowSeconds;

  return {
    success: true,
    limit: maxRequests,
    remaining,
    reset,
  };
}
