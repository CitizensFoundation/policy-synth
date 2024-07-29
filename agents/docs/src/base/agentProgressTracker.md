# PsProgressTracker

The `PsProgressTracker` class is designed to track and manage the progress of an agent using Redis for state persistence. It extends the `PolicySynthAgentBase` class and provides methods to load, update, and save the agent's status.

## Properties

| Name            | Type          | Description                                                                 |
|-----------------|---------------|-----------------------------------------------------------------------------|
| redis           | Redis         | An instance of the Redis client.                                            |
| redisStatusKey  | string        | The Redis key used to store the agent's status.                             |
| status          | PsAgentStatus | The current status of the agent.                                            |
| startProgress   | number        | The starting progress value.                                                |
| endProgress     | number        | The ending progress value.                                                  |

## Constructor

### `constructor(redisStatusKey: string, startProgress: number, endProgress: number, redisUrl: string = process.env.REDIS_AGENT_URL || "redis://localhost:6379")`

Initializes a new instance of the `PsProgressTracker` class.

#### Parameters

- `redisStatusKey` (string): The Redis key used to store the agent's status.
- `startProgress` (number): The starting progress value.
- `endProgress` (number): The ending progress value.
- `redisUrl` (string, optional): The URL of the Redis server. Defaults to the value of the `REDIS_AGENT_URL` environment variable or `"redis://localhost:6379"`.

## Methods

### `public async loadStatusFromRedis(): Promise<void>`

Loads the agent's status from Redis.

### `public async updateRangedProgress(progress: number | undefined, message: string): Promise<void>`

Updates the agent's progress within a specified range and adds a message to the status.

#### Parameters

- `progress` (number | undefined): The progress value to update.
- `message` (string): The message to add to the status.

### `public async updateProgress(progress: number | undefined, message: string): Promise<void>`

Updates the agent's progress and adds a message to the status.

#### Parameters

- `progress` (number | undefined): The progress value to update.
- `message` (string): The message to add to the status.

### `async saveRedisStatus(): Promise<void>`

Saves the agent's status to Redis.

### `public getProgress(): number`

Returns the current progress of the agent.

#### Returns

- `number`: The current progress value.

### `public getMessages(): string[]`

Returns the messages associated with the agent's status.

#### Returns

- `string[]`: An array of messages.

### `public getState(): string`

Returns the current state of the agent.

#### Returns

- `string`: The current state of the agent.

### `public async setCompleted(message: string): Promise<void>`

Sets the agent's status to "completed" and updates the progress to 100%.

#### Parameters

- `message` (string): The message to add to the status.

### `public async setError(errorMessage: string): Promise<void>`

Sets the agent's status to "error" and adds an error message.

#### Parameters

- `errorMessage` (string): The error message to add to the status.

### `public formatNumber(number: number, fractions = 0): string`

Formats a number with a specified number of fraction digits.

#### Parameters

- `number` (number): The number to format.
- `fractions` (number, optional): The number of fraction digits. Defaults to 0.

#### Returns

- `string`: The formatted number.

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

const tracker = new PsProgressTracker("agent:status:key", 0, 100);

(async () => {
  await tracker.updateProgress(50, "Halfway there!");
  console.log(tracker.getProgress()); // 50
  console.log(tracker.getMessages()); // ["Halfway there!"]
})();
```