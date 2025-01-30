import Redis from "ioredis";
const sharedRedisClient = new Redis(process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379");
export default sharedRedisClient;
//# sourceMappingURL=redisClient.js.map