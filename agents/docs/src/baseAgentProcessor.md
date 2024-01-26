# BaseAgentProcessor

This class is an abstract extension of `PolicySynthAgentBase` designed to process jobs with specific memory initialization and processing logic. It interacts with Redis for memory storage and retrieval.

## Properties

| Name           | Type  | Description                                           |
|----------------|-------|-------------------------------------------------------|
| job            | Job   | The current job being processed.                      |
| defaultStages  | object | A predefined set of stages for processing. |

## Methods

| Name            | Parameters        | Return Type            | Description                                                                 |
|-----------------|-------------------|------------------------|-----------------------------------------------------------------------------|
| getRedisKey     | groupId: number   | string                 | Generates a Redis key based on the provided group ID.                       |
| initializeMemory| job: Job          | Promise<void>          | Abstract method to initialize memory for the job. Must be implemented by subclasses. |
| process         | -                 | Promise<void>          | Abstract method to process the job. Must be implemented by subclasses.      |
| setup           | job: Job          | Promise<void>          | Prepares the processor by setting the job and initializing memory.          |
| saveMemory      | -                 | Promise<void>          | Saves the current memory state to Redis.                                    |

## Example

```typescript
import { BaseAgentProcessor } from '@policysynth/agents/baseAgentProcessor.ts';
import { Job } from "bullmq";

class CustomAgentProcessor extends BaseAgentProcessor {
  async initializeMemory(job: Job): Promise<void> {
    // Custom memory initialization logic
  }

  async process(): Promise<void> {
    // Custom job processing logic
  }
}

// Example setup and processing of a job
const customProcessor = new CustomAgentProcessor();
const job = new Job(); // Assuming job is already defined
await customProcessor.setup(job);
await customProcessor.process();
```