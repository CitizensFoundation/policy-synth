# runProblemStage

This script is used to manage the problem-solving stages for a given project by interacting with a Redis database and a BullMQ queue.

## Properties

| Name       | Type                     | Description                                   |
|------------|--------------------------|-----------------------------------------------|
| redis      | ioredis.Redis            | Instance of ioredis connected to Redis server.|
| myQueue    | Queue                    | BullMQ Queue instance for managing jobs.      |
| projectId  | string \| undefined      | Project ID passed as a command-line argument. |

## Methods

| Name       | Parameters               | Return Type | Description                 |
|------------|--------------------------|-------------|-----------------------------|
| (none)     | (none)                   | (none)      | (no methods, script execution) |

## Example

```typescript
// Example usage of runProblemStage
import { runProblemStage } from '@policysynth/agents/problems/tools/runProblemStage.js';

// Assuming environment variables and Redis are configured:
// Command line usage: node runProblemStage <projectId>
```