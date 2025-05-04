# PsProgressTracker

The `PsProgressTracker` class is a utility for tracking and updating the progress of an agent's task, with status persistence in Redis. It extends `PolicySynthAgentBase` and is designed to be used by PolicySynth agents to report their progress, state, and messages in a distributed or multi-process environment.

## Properties

| Name            | Type                | Description                                                                                 |
|-----------------|---------------------|---------------------------------------------------------------------------------------------|
| redis           | Redis               | The Redis client instance used for status persistence.                                      |
| redisStatusKey  | string              | The Redis key under which the agent's status is stored.                                     |
| status          | PsAgentStatus       | The current status object of the agent (state, progress, messages, lastUpdated, etc.).      |
| startProgress   | number              | The starting value of the progress range (for ranged progress updates).                     |
| endProgress     | number              | The ending value of the progress range (for ranged progress updates).                       |

## Constructor

```typescript
constructor(
  redisStatusKey: string,
  startProgress: number,
  endProgress: number,
  redisUrl?: string
)
```

- **redisStatusKey**: The Redis key to use for storing status.
- **startProgress**: The lower bound of the progress range.
- **endProgress**: The upper bound of the progress range.
- **redisUrl**: (Optional) Redis connection URL. Defaults to environment variables or `redis://localhost:6379`.

## Methods

| Name                  | Parameters                                                                 | Return Type         | Description                                                                                      |
|-----------------------|----------------------------------------------------------------------------|---------------------|--------------------------------------------------------------------------------------------------|
| loadStatusFromRedis   | none                                                                       | Promise<void>       | Loads the agent's status from Redis and sets the `status` property.                              |
| updateRangedProgress  | progress: number \| undefined, message: string                             | Promise<void>       | Updates progress within the specified range and appends a message, then saves to Redis.           |
| updateProgress        | progress: number \| undefined, message: string                             | Promise<void>       | Updates progress (absolute, 0-100) and appends a message, then saves to Redis.                   |
| saveRedisStatus       | none                                                                       | Promise<void>       | Persists the current `status` object to Redis.                                                   |
| getProgress           | none                                                                       | number              | Returns the current progress value (0 if not set).                                               |
| getMessages           | none                                                                       | string[]            | Returns the array of status messages (empty array if not set).                                   |
| getState              | none                                                                       | string              | Returns the current state (e.g., "running", "completed", "error", or "unknown" if not set).      |
| setCompleted          | message: string                                                            | Promise<void>       | Sets the agent's state to "completed", progress to 100, appends a message, and saves to Redis.   |
| setError              | errorMessage: string                                                       | Promise<void>       | Sets the agent's state to "error", appends an error message, and saves to Redis.                 |
| formatNumber          | number: number, fractions?: number                                         | string              | Formats a number with the specified number of fraction digits (default: 0).                      |

## Example

```typescript
import { PsProgressTracker } from '@policysynth/agents/base/agentProgressTracker.js';

// Create a progress tracker for an agent
const tracker = new PsProgressTracker(
  "agent:status:123", // Redis key
  0,                  // Start progress
  100                 // End progress
);

// Update progress (absolute)
await tracker.updateProgress(10, "Started processing...");

// Update progress (ranged, e.g., for a subtask)
await tracker.updateRangedProgress(50, "Halfway through subtask");

// Mark as completed
await tracker.setCompleted("Task finished successfully!");

// Mark as error
await tracker.setError("An error occurred during processing.");

// Get current progress and messages
const progress = tracker.getProgress();
const messages = tracker.getMessages();
const state = tracker.getState();
```

---

**Note:**  
- The class expects a running Redis instance and uses a shared Redis client.
- The `status` object follows the `PsAgentStatus` interface, which includes `state`, `progress`, `messages`, and `lastUpdated`.
- The class is robust to missing or uninitialized status and logs errors if Redis is unavailable or misconfigured.
- Useful for distributed agent orchestration, progress reporting, and UI feedback in PolicySynth agent workflows.