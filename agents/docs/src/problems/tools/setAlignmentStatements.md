# SetAlignmentStatements

This script sets up custom instructions and problem statements for various projects based on the provided project ID. It interacts with a Redis database to fetch and update memory data for each project.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| redis         | ioredis.Redis | Redis client instance used to interact with the Redis database. |
| projectId     | string | The project ID passed as a command-line argument. |

## Methods

| Name               | Parameters                | Return Type | Description                 |
|--------------------|---------------------------|-------------|-----------------------------|
| setupProjectOne    | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project One. |
| setupProjectTwo    | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Two. |
| setupProjectThree  | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Three. |
| setupProjectFour   | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Four. |
| setupProjectFive   | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Five. |
| setupProjectSix    | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Six. |
| setupProjectSeven  | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Seven. |
| setupProjectEight  | memory: PsBaseMemoryData  | void        | Sets up custom instructions and problem statement for Project Eight. |

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const setupProjectOne = (memory: PsBaseMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.customInstructions.createSolutions = `
    1. Never create solution components in the form of frameworks or holistic approaches
    2. Solution Components should include only one core idea.
    3. The solution component title should indicate the benefits or results of implementing the solution component.
    4. Remember that the main facilitator for implementation will be civil society working with governments.
    5. Frame solution components with the intention of convincing politicians and governments to put them into action.
    6. Avoid blockchain solution components.
  `;

  memory.customInstructions.rankSolutions = `
    1. The main facilitator for implementation will be civil society working with governments.
    2. Later those solution components will be brought into comprehensive policy proposals.
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
    1. Solution components should not include more than one core idea.
    2. Solution components can have more than one implementation detail ideas.
    3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
    4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    5. Core ideas are distinct concepts or strategies that are central to the solution component.
  `;
};

// Similar setup functions for other projects...

const projectId = process.argv[2];
if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as PsBaseMemoryData;

  if (projectId == "1") {
    setupProjectOne(memory);
  } else if (projectId == "2") {
    setupProjectTwo(memory);
  } else if (projectId == "3") {
    setupProjectThree(memory);
  } else if (projectId == "4") {
    setupProjectFour(memory);
  } else if (projectId == "5") {
    setupProjectFive(memory);
  } else if (projectId == "6") {
    setupProjectSix(memory);
  } else if (projectId == "7") {
    setupProjectSeven(memory);
  } else if (projectId == "8") {
    setupProjectEight(memory);
  }

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("After saving");

  process.exit(0);
} else {
  console.log("No project id provided - set alignment statements");
  process.exit(1);
}
```