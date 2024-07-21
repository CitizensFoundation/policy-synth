# PsProgressTracker

The `PsProgressTracker` class is designed to track the progress of an agent and store its state in a Redis database. It extends the `PolicySynthAgentBase` class and provides methods to load, update, and save the agent's memory.

## Properties

| Name            | Type                | Description                                      |
|-----------------|---------------------|--------------------------------------------------|
| redis           | Redis               | Instance of the Redis client.                    |
| redisMemoryKey  | string              | Key used to store the agent's memory in Redis.   |
| memory          | PsAgentMemoryData   | Object to store the agent's memory data.         |
| startProgress   | number              | Initial progress value.                          |
| endProgress     | number              | Final progress value.                            |

## Constructor

```typescript
constructor(
  redisMemoryKey: string,
  startProgress: number,
  endProgress: number,
  redisUrl: string = process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
)
```

### Parameters

- `redisMemoryKey` (string): Key used to store the agent's memory in Redis.
- `startProgress` (number): Initial progress value.
- `endProgress` (number): Final progress value.
- `redisUrl` (string, optional): URL of the Redis server. Defaults to `process.env.REDIS_MEMORY_URL` or `"redis://localhost:6379"`.

## Methods

### loadMemoryFromRedis

```typescript
public async loadMemoryFromRedis(): Promise<void>
```

Loads the agent's memory from Redis.

### updateRangedProgress

```typescript
public async updateRangedProgress(progress: number | undefined, message: string): Promise<void>
```

Updates the agent's progress within a specified range and adds a message.

### Parameters

- `progress` (number | undefined): Progress value to update.
- `message` (string): Message to add to the memory.

### updateProgress

```typescript
public async updateProgress(progress: number | undefined, message: string): Promise<void>
```

Updates the agent's progress and adds a message.

### Parameters

- `progress` (number | undefined): Progress value to update.
- `message` (string): Message to add to the memory.

### saveMemory

```typescript
private async saveMemory(): Promise<void>
```

Saves the agent's memory to Redis.

### getProgress

```typescript
public getProgress(): number
```

Returns the current progress value.

### getMessages

```typescript
public getMessages(): string[]
```

Returns the list of messages.

### getState

```typescript
public getState(): string
```

Returns the current state of the agent.

### setAgentId

```typescript
public setAgentId(agentId: number): void
```

Sets the agent's ID.

### Parameters

- `agentId` (number): ID of the agent.

### setCompleted

```typescript
public async setCompleted(message: string): Promise<void>
```

Sets the agent's state to "completed" and updates the progress to 100%.

### Parameters

- `message` (string): Message to add to the memory.

### setError

```typescript
public async setError(errorMessage: string): Promise<void>
```

Sets the agent's state to "error" and adds an error message.

### Parameters

- `errorMessage` (string): Error message to add to the memory.

### formatNumber

```typescript
public formatNumber(number: number, fractions = 0): string
```

Formats a number with a specified number of fraction digits.

### Parameters

- `number` (number): Number to format.
- `fractions` (number, optional): Number of fraction digits. Defaults to 0.

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

const tracker = new PsProgressTracker("agent:memory:key", 0, 100);

await tracker.loadMemoryFromRedis();
await tracker.updateProgress(50, "Halfway there!");
console.log(tracker.getProgress()); // 50
console.log(tracker.getMessages()); // ["Halfway there!"]
```