# BaseAgentProcessor

This class extends `PolicySynthAgentBase` and provides an abstract structure for processing jobs with memory management using Redis.

## Properties

| Name | Type | Description |
|------|------|-------------|
| job  | Job  | The current job being processed. |

## Methods

| Name            | Parameters       | Return Type     | Description |
|-----------------|------------------|-----------------|-------------|
| getRedisKey     | groupId: number  | string          | Returns a Redis key string based on the provided group ID. |
| initializeMemory| job: Job         | Promise<void>   | Abstract method to initialize memory for the job. |
| process         | -                | Promise<void>   | Abstract method to process the job. |
| setup           | job: Job         | Promise<void>   | Sets up the job and initializes memory by fetching from Redis or logs an error if not found. |
| saveMemory      | -                | Promise<void>   | Saves the current memory state to Redis or logs an error if memory is undefined. |

## Example

```typescript
import { BaseAgentProcessor } from '@policysynth/agents/baseAgentProcessor.js';
import { Job } from "bullmq";

class MyAgentProcessor extends BaseAgentProcessor {
  async initializeMemory(job: Job): Promise<void> {
    // Implementation specific to initializing memory
  }

  async process(): Promise<void> {
    // Implementation specific to processing the job
  }
}

// Example usage
const job = new Job(); // Assuming job is created or fetched appropriately
const myProcessor = new MyAgentProcessor();
await myProcessor.setup(job);
await myProcessor.process();
await myProcessor.saveMemory();
```