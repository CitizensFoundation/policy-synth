# PsProgressTracker

The `PsProgressTracker` class is responsible for tracking the progress of an agent's task and storing the status in a Redis database. It extends the `PolicySynthAgentBase` class and provides methods to load, update, and save the agent's status.

## Properties

| Name            | Type          | Description                                                                 |
|-----------------|---------------|-----------------------------------------------------------------------------|
| redis           | Redis         | An instance of the Redis client used to interact with the Redis database.   |
| redisStatusKey  | string        | The key used to store and retrieve the agent's status in Redis.             |
| status          | PsAgentStatus | The current status of the agent, including progress, state, and messages.   |
| startProgress   | number        | The starting point of the progress range.                                   |
| endProgress     | number        | The ending point of the progress range.                                     |

## Methods

| Name                   | Parameters                                      | Return Type | Description                                                                 |
|------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor            | redisStatusKey: string, startProgress: number, endProgress: number, redisUrl?: string | void        | Initializes a new instance of the `PsProgressTracker` class.                |
| loadStatusFromRedis    | -                                               | Promise<void> | Loads the agent's status from Redis.                                        |
| updateRangedProgress   | progress: number \| undefined, message: string  | Promise<void> | Updates the agent's progress within a specified range and saves it to Redis.|
| updateProgress         | progress: number \| undefined, message: string  | Promise<void> | Updates the agent's progress and saves it to Redis.                         |
| saveRedisStatus        | -                                               | Promise<void> | Saves the current status of the agent to Redis.                             |
| getProgress            | -                                               | number       | Returns the current progress of the agent.                                  |
| getMessages            | -                                               | string[]     | Returns the messages associated with the agent's status.                    |
| getState               | -                                               | string       | Returns the current state of the agent.                                     |
| setCompleted           | message: string                                 | Promise<void> | Sets the agent's status to "completed" and updates the progress to 100%.    |
| setError               | errorMessage: string                            | Promise<void> | Sets the agent's status to "error" and logs the error message.              |
| formatNumber           | number: number, fractions?: number              | string       | Formats a number with a specified number of decimal places.                 |

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

const progressTracker = new PsProgressTracker('agentStatusKey', 0, 100);
await progressTracker.updateProgress(50, 'Task is halfway done.');
console.log(progressTracker.getProgress()); // Outputs: 50
```