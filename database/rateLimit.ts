import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redisDB";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, "24h"),
  timeout: 24 * 60 * 60, // 24 hours
});

export default ratelimit;