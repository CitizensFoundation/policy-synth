# BaseAgentProcessor

This class extends the `PolicySynthAgentBase` and is designed to handle job processing with memory management using Redis. It is an abstract class that requires the implementation of `initializeMemory` and `process` methods for specific job processing logic.

## Properties

| Name | Type | Description |
|------|------|-------------|
| job  | Job  | The job instance from BullMQ. |

## Methods

| Name          | Parameters       | Return Type     | Description |
|---------------|------------------|-----------------|-------------|
| getRedisKey   | groupId: number  | string          | Generates a Redis key using the provided group ID. |
| initializeMemory | job: Job      | Promise<void>   | Abstract method to initialize memory for the job. Must be implemented by subclasses. |
| process       | -                | Promise<void>   | Abstract method to process the job. Must be implemented by subclasses. |
| setup         | job: Job         | Promise<void>   | Sets up the job processing environment, including loading memory data from Redis. |
| saveMemory    | -                | Promise<void>   | Saves the current memory state to Redis. |

## Example

```typescript
import { BaseAgentProcessor } from '@policysynth/agents/baseAgentProcessor.js';
import { Job } from "bullmq";

class MyAgentProcessor extends BaseAgentProcessor {
  async initializeMemory(job: Job): Promise<void> {
    // Implementation for initializing memory specific to MyAgentProcessor
  }

  async process(): Promise<void> {
    // Implementation for processing the job specific to MyAgentProcessor
  }
}

// Example usage
const myAgentProcessor = new MyAgentProcessor();
const job = new Job(); // Assuming job is already created or obtained from a queue
await myAgentProcessor.setup(job);
await myAgentProcessor.process();
```