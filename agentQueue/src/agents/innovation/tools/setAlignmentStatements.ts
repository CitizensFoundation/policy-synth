import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-innovation");

const output = await redis.get("st_mem:1:id");

const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

memory.customInstructions.createSolutions = `
  1. Use the provided information to generate clear, actionable solutions or a solution. These should be designed to be later consolidated into comprehensive policy proposals.
  2. Make sure solution titles are concise, engaging, and informative.
  3. Ensure solutions are straightforward and easy to understand.
  4. Keep solutions titles to maximum of 7 words and do not use abbreviations except for acronyms.
  5. Avoid comprehensive frameworks for solutions. Opt for simpler structures that include a few key attributes.
  6. Remember that the main facilitator for implementation will be civil society working with governments.
  7. Frame solutions with the intention of convincing politicians and governments to put them into action.
`;

memory.customInstructions.rankSolutions = `
  1. Assess the solutions based on their practicality and feasibility in the real world.
  2. Prefer solutions that are simple and not overly comprehensive, as they will later be incorporated into broader policy proposals.
  3. Prefer solutions which offer simple structures with a few key attributes, rather than those that present as comprehensive frameworks.
  4. Take into account whether a solution seems compelling enough to convince politicians and governments to implement it.
`;

await redis.set("st_mem:1:id", JSON.stringify(memory));

console.log("After saving");

process.exit(0);
