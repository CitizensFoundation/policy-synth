# runSolutionStage

This script manages the transition of solution stages for projects using Redis and BullMQ.

## Properties

| Name       | Type                      | Description                                   |
|------------|---------------------------|-----------------------------------------------|
| redis      | ioredis.Redis             | Redis client instance.                        |
| myQueue    | Queue                     | BullMQ Queue instance for managing jobs.      |
| projectId  | string \| undefined       | Project ID passed as a command line argument. |

## Methods

| Name       | Parameters                | Return Type | Description                 |
|------------|---------------------------|-------------|-----------------------------|
| (none)     | (none)                    | (none)      | (none)                      |

## Example

```typescript
import { runSolutionStage } from '@policysynth/agents/solutions/tools/runSolutionStage.js';

// Example usage:
// node runSolutionStage.js <projectId>
```