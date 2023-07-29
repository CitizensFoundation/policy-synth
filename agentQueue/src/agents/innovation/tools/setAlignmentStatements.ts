import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-innovation");

const output = await redis.get("st_mem:1:id");

const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
memory.customInstructions = {} as any;
memory.customInstructions.createSolutions = `
  1. Never create solutions in the form of frameworks or holistic approaches
  2. Solutions should include only one core idea.
  3. The solution title should indicate the benefits or results of implementing the solution.
  4. Remember that the main facilitator for implementation will be civil society working with governments.
  5. Frame solutions with the intention of convincing politicians and governments to put them into action.
  6. Avoid blockchain solutions.
`;

memory.customInstructions.rankSolutions = `
  1. Assess the solutions based on:
  - Importance to the problem
  - How innovation they are
  - How practical they are
`;

memory.customInstructions.reapSolutions = `
  1. Non-viable solutions include more than two core ideas.
  2. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
  3. Core ideas are distinct concepts or strategies that are central to the solution.

  2. Examples of solutions that are not viable and have more than two core ideas:
  title: Strengthening Democratic Governance: Active Citizen Engagement, Institutional Accountability, and Digital Transformation

  title: Revitalizing Democracies through Informed Citizenry, Integrity Enhancement, and Digital Engagement

  title: Revitalizing Democracy: Emphasizing Civic Education, Streamlining Policy Frameworks, and Advancing Digital Governance

  3. Examples of solutions that are viable and have two or less ideas.
  title: Reinventing Democracy: Enhancing Citizen Participation & Institutional Transparency

  title: Revitalizing Democratic Governance: Fostering Active Participation and Promoting Institutional Integrity through Digital Innovation

  title: Rebuilding Confidence in Democracy with Enhanced Civic Engagement and Institutional Accountability

  title: Boosting Democracy: Empower Citizens with Enhanced Democratic Education and Digitalized Transparent Governance
`;

await redis.set("st_mem:1:id", JSON.stringify(memory));

console.log("After saving");

process.exit(0);
