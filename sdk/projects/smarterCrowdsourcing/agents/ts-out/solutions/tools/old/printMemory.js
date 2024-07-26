import ioredis from "ioredis";
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
const output = await redis.get("st_mem:1:id");
const memory = JSON.parse(output);
console.log("output", JSON.stringify(memory, null, 2));
process.exit(0);
//# sourceMappingURL=printMemory.js.map