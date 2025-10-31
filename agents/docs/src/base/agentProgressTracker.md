# PsProgressTracker

The `PsProgressTracker` class is a utility for tracking and updating the progress of an agent's task, with persistent status storage in Redis. It is designed to be used within the PolicySynth agent framework and extends the `PolicySynthAgentBase` class.

This class allows for:
- Loading and saving agent status from/to Redis.
- Updating progress (either absolute or within a range).
- Managing agent state (e.g., running, completed, error).
- Appending progress messages.
- Formatting numbers for display.

## Properties

| Name            | Type         | Description                                                                                  |
|-----------------|--------------|----------------------------------------------------------------------------------------------|
| redis           | Redis        | The Redis client instance used for status storage.                                           |
| redisStatusKey  | string       | The Redis key under which the agent's status is stored.                                      |
| status          | PsAgentStatus| The current status object of the agent (state, progress, messages, lastUpdated, details).    |
| startProgress   | number       | The starting value of the progress range (for ranged progress updates).                      |
| endProgress     | number       | The ending value of the progress range (for ranged progress updates).                        |

## Constructor

```typescript
constructor(
  redisStatusKey: string,
  startProgress: number,
  endProgress: number,
  redisUrl?: string
)
```

- **redisStatusKey**: The Redis key for storing the agent's status.
- **startProgress**: The start value for ranged progress updates.
- **endProgress**: The end value for ranged progress updates.
- **redisUrl**: (Optional) The Redis connection URL. Defaults to environment variables or `redis://localhost:6379`.

## Methods

| Name                  | Parameters                                                                 | Return Type   | Description                                                                                      |
|-----------------------|----------------------------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------|
| loadStatusFromRedis   | none                                                                       | Promise<void> | Loads the agent's status from Redis and sets the `status` property.                              |
| updateRangedProgress  | progress: number \| undefined, message: string                             | Promise<void> | Updates progress within the specified range and appends a message, then saves to Redis.          |
| updateProgress        | progress: number \| undefined, message: string                             | Promise<void> | Updates absolute progress and appends a message, then saves to Redis.                            |
| saveRedisStatus       | none                                                                       | Promise<void> | Persists the current `status` to Redis.                                                          |
| getProgress           | none                                                                       | number        | Returns the current progress value (0 if not set).                                               |
| getMessages           | none                                                                       | string[]      | Returns the array of progress messages (empty array if not set).                                 |
| getState              | none                                                                       | string        | Returns the current state of the agent (e.g., "running", "completed", "error", or "unknown").    |
| setCompleted          | message: string                                                            | Promise<void> | Sets the agent state to "completed", progress to 100, appends a message, and saves to Redis.     |
| setError              | errorMessage: string                                                       | Promise<void> | Sets the agent state to "error", appends an error message, and saves to Redis.                   |
| formatNumber          | number: number, fractions?: number                                         | string        | Formats a number with the specified number of fraction digits (default: 0).                      |

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

// Create a progress tracker for an agent
const tracker = new PsProgressTracker(
  "agent:status:123", // Redis key
  0,                  // Start progress
  100                 // End progress
);

// Update progress within a range
await tracker.updateRangedProgress(50, "Halfway done!");

// Update absolute progress
await tracker.updateProgress(75, "Three quarters done!");

// Mark as completed
await tracker.setCompleted("Task finished successfully!");

// Mark as error
await tracker.setError("An error occurred during processing.");

// Get current progress and messages
const progress = tracker.getProgress();
const messages = tracker.getMessages();
const state = tracker.getState();

console.log(`Progress: ${progress}, State: ${state}, Messages:`, messages);
```

---

**Note:**  
- The `PsAgentStatus` type includes:  
  - `state`: `"running" | "paused" | "stopped" | "error" | "completed"`
  - `progress`: `number`
  - `messages`: `string[]`
  - `lastUpdated`: `number`
  - `details?`: `Record<string, any>`
- The class expects a running Redis instance and appropriate environment variables if not using the default URL.
- All progress and state changes are persisted in Redis under the provided key.