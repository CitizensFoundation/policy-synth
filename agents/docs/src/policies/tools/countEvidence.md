# CountWebEvidenceProcessor

This class extends `BaseProlemSolvingAgent` to count all web evidence related to policies.

## Properties

| Name                        | Type                             | Description                                   |
|-----------------------------|----------------------------------|-----------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore       | Store for evidence web page vectors.          |

## Methods

| Name       | Parameters                                      | Return Type | Description                                                                 |
|------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| countAll   | policy: PSPolicy, subProblemIndex: number       | Promise<void> | Counts all web evidence for a given policy and sub-problem index.          |
| process    |                                                 | Promise<void> | Processes the evidence counting for all sub-problems and their policies.   |

## Example

```javascript
// Example usage of CountWebEvidenceProcessor
import { CountWebEvidenceProcessor } from '@policysynth/agents/policies/tools/countEvidence.js';
import ioredis from "ioredis";

const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

async function run() {
  const projectId = process.argv[2];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!); // Assuming IEngineInnovationMemoryData type

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