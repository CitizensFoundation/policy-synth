import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-innovation");

const output = await redis.get("st_mem:1:id");

const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

memory.systemInstructions.createSolutions = `
  1. Generated solutions should not be too complicated. Later the solutions will be brought together into comprehensive policy proposals.
  2. Assume that civil society will be the main driver of getting solutions implemented.
  3. Keep in mind that politicans and governments need to be convinced to implement solutions.
`

memory.systemInstructions.rankSolutions = `
  1. Solutions should be realistic in terms of being practical to implement in todays world.
  2. Solutions should not be too comprehensive. Later the solutions will be brought together into full policy proposals.
`

await redis.set("st_mem:1:id", JSON.stringify(memory));

console.log("After saving");

process.exit(0);
