import { Queue } from "bullmq";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const myQueue = new Queue("agent-innovation");
const output = await redis.get("st_mem:1:id");
const memory = JSON.parse(output);
memory.customInstructions = {};
memory.customInstructions.createSolutions = `
  1. Never create solution components in the form of frameworks or holistic approaches
  2. Solution Components should include only one core idea.
  3. The solution component title should indicate the benefits or results of implementing the solution component.
  4. Remember that the main facilitator for implementation will be civil society working with governments.
  5. Frame solution components with the intention of convincing politicians and governments to put them into action.
  6. Avoid blockchain solution components.
`;
memory.customInstructions.rankSolutions = `
  1. Assess the solution components based on it's title and description.
  2. Later those solution components will be brought into comprehensive policy proposals.
  3. Use provided ratings also in a toughtful and balanced way for your decision.
`;
memory.customInstructions.rateSolutionsJsonFormat = `
  {
    highPriorityRatings: {
      howImportantToProblem,
      howInnovative,
      howPractical,
      howEthical,
      howComplex,
    },
    otherRatings: {
      benefitsForCitizens,
      benefitsForGovernments,
      benefitsForCivilSociety,
      benefitsForPrivateSector,
      benefitsForTheClimate
    }
  }
`;
memory.customInstructions.reapSolutions = `
  1. Filter out solution components that include more than two unique core ideas, if the ideas are closely related then do not filter them out.
  2. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
  3. Core ideas are distinct concepts or strategies that are central to the solution component.
  4. If a solution component includes multiple strategies or methods that serve to implement or facilitate a single core idea, do not consider these as separate core ideas. Instead, view them as parts of a comprehensive approach to implementing the core idea.
`;
await redis.set("st_mem:1:id", JSON.stringify(memory));
console.log("After saving");
process.exit(0);
