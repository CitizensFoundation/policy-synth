import { Queue } from "bullmq";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const myQueue = new Queue("agent-innovation");
const output = await redis.get("st_mem:1:id");
const memory = JSON.parse(output);
memory.customInstructions = {};
memory.customInstructions.createSolutions = `
  1. Never create solutions in the form of frameworks or holistic approaches
  2. Solutions should include only one core idea.
  3. The solution title should indicate the benefits or results of implementing the solution.
  4. Remember that the main facilitator for implementation will be civil society working with governments.
  5. Frame solutions with the intention of convincing politicians and governments to put them into action.
  6. Avoid blockchain solutions
`;
memory.customInstructions.rankSolutions = `
  1. Assess the solutions based on their practicality and feasibility in the real world.
  2. Prefer solutions that are simple and focused, avoiding overly comprehensive frameworks.
  3. Take into account whether a solution seems compelling enough to convince politicians and governments to implement it
`;
await redis.set("st_mem:1:id", JSON.stringify(memory));
console.log("After saving");
process.exit(0);
