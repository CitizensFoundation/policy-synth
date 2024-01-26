# BaseAgentProcessor

This class extends the `PolicySynthAgentBase` to process jobs with specific logic for handling Redis memory operations. It is designed to be extended by other classes that implement the abstract methods `initializeMemory` and `process`.

## Properties

| Name            | Type   | Description                                           |
|-----------------|--------|-------------------------------------------------------|
| job             | Job    | The current job being processed.                      |
| defaultStages   | object | A predefined set of stages for processing.            |

## Methods

| Name            | Parameters            | Return Type     | Description                                                                 |
|-----------------|-----------------------|-----------------|-----------------------------------------------------------------------------|
| getRedisKey     | groupId: number       | string          | Generates a Redis key based on the provided group ID.                       |
| initializeMemory| job: Job              | Promise<void>   | Abstract method to initialize memory for the job.                           |
| process         |                       | Promise<void>   | Abstract method to process the job.                                         |
| setup           | job: Job              | Promise<void>   | Sets up the job, including initializing memory from Redis if available.     |
| saveMemory      |                       | Promise<void>   | Saves the current memory state to Redis.                                    |

## Example

```typescript
import { BaseAgentProcessor } from '@policysynth/agents/baseAgentProcessor.js';
import { Job } from 'bullmq';

class MyAgentProcessor extends BaseAgentProcessor {
  async initializeMemory(job: Job): Promise<void> {
    // Implementation for initializing memory
  }

  async process(): Promise<void> {
    // Implementation for processing the job
  }
}

// Example usage
const myAgentProcessor = new MyAgentProcessor();
const job = new Job(); // Assuming job is already defined
await myAgentProcessor.setup(job);
await myAgentProcessor.process();
```