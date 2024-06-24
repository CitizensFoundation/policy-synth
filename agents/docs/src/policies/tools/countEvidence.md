# CountWebEvidenceProcessor

This class extends `BaseProblemSolvingAgent` to process and count web evidence related to policies.

## Properties

| Name                        | Type                             | Description                                       |
|-----------------------------|----------------------------------|---------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore       | Store for managing evidence web page vectors.     |

## Methods

| Name       | Parameters                                  | Return Type | Description                                         |
|------------|---------------------------------------------|-------------|-----------------------------------------------------|
| countAll   | policy: PSPolicy, subProblemIndex: number   | Promise<void> | Counts all web evidence for a given policy.        |
| process    | -                                           | Promise<void> | Processes and counts evidence for all sub problems. |

## Example

```typescript
// Example usage of CountWebEvidenceProcessor
import { CountWebEvidenceProcessor } from '@policysynth/agents/policies/tools/countEvidence.js';
import ioredis from "ioredis";

const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

async function run() {
  const projectId = process.argv[2];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

    const counts = new CountWebEvidenceProcessor({} as any, memory);
    await counts.process();
    process.exit(0);
  } else {
    console.log("No project id provided - count evidence");
    process.exit(1);
  }
}

run();
```