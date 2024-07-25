# PsProgressTracker

The `PsProgressTracker` class is designed to track and manage the progress of an agent using Redis for state persistence. It extends the `PolicySynthAgentBase` class and provides methods to load, update, and save the agent's status.

## Properties

| Name            | Type         | Description                                      |
|-----------------|--------------|--------------------------------------------------|
| redis           | Redis        | Instance of the Redis client.                    |
| redisStatusKey  | string       | Key used to store and retrieve status in Redis.  |
| status          | PsAgentStatus| Current status of the agent.                     |
| startProgress   | number       | Starting progress value.                         |
| endProgress     | number       | Ending progress value.                           |

## Constructor

### `constructor(redisStatusKey: string, startProgress: number, endProgress: number, redisUrl: string = process.env.REDIS_MEMORY_URL || "redis://localhost:6379")`

Initializes a new instance of the `PsProgressTracker` class.

#### Parameters

- `redisStatusKey` (string): Key used to store and retrieve status in Redis.
- `startProgress` (number): Starting progress value.
- `endProgress` (number): Ending progress value.
- `redisUrl` (string, optional): URL of the Redis server. Defaults to `process.env.REDIS_MEMORY_URL` or `"redis://localhost:6379"`.

## Methods

### `public async loadStatusFromRedis(): Promise<void>`

Loads the agent's status from Redis.

### `public async updateRangedProgress(progress: number | undefined, message: string): Promise<void>`

Updates the agent's progress within a specified range and adds a message.

#### Parameters

- `progress` (number | undefined): Progress value to update.
- `message` (string): Message to add to the status.

### `public async updateProgress(progress: number | undefined, message: string): Promise<void>`

Updates the agent's progress and adds a message.

#### Parameters

- `progress` (number | undefined): Progress value to update.
- `message` (string): Message to add to the status.

### `private async saveRedisStatus(): Promise<void>`

Saves the current status to Redis.

### `public getProgress(): number`

Returns the current progress value.

### `public getMessages(): string[]`

Returns the list of messages.

### `public getState(): string`

Returns the current state of the agent.

### `public async setCompleted(message: string): Promise<void>`

Sets the agent's state to "completed" and updates the progress to 100%.

#### Parameters

- `message` (string): Message to add to the status.

### `public async setError(errorMessage: string): Promise<void>`

Sets the agent's state to "error" and adds an error message.

#### Parameters

- `errorMessage` (string): Error message to add to the status.

### `public formatNumber(number: number, fractions = 0): string`

Formats a number with a specified number of fraction digits.

#### Parameters

- `number` (number): Number to format.
- `fractions` (number, optional): Number of fraction digits. Defaults to 0.

#### Returns

- `string`: Formatted number.

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

const progressTracker = new PsProgressTracker("agentStatusKey", 0, 100);

(async () => {
  await progressTracker.updateProgress(50, "Halfway there!");
  console.log(progressTracker.getProgress()); // 50
  console.log(progressTracker.getMessages()); // ["Halfway there!"]
})();
```