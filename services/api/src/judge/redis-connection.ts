import type { RedisOptions } from "ioredis";

export function redisConnectionFromUrl(
  value: string,
  mode: "producer" | "worker"
): RedisOptions {
  const url = new URL(value);
  if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
    throw new Error("REDIS_URL must use redis:// or rediss://");
  }

  const database = url.pathname.slice(1);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: database ? Number(database) : 0,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: mode === "worker" ? null : 1,
    enableOfflineQueue: mode === "worker"
  };
}
