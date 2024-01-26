import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const output = await redis.get("st_mem:1:id");

const memory = JSON.parse(output!) as IEngineInnovationMemoryData

console.log("output", JSON.stringify(memory, null, 2));

process.exit(0);
