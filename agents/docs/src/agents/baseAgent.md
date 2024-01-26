# BaseProcessingAgent

BaseProcessingAgent is an abstract class that extends from PolicySynthAgentBase and provides a structure for agents that interact with a Redis database to manage memory state. It includes methods for setting up the agent with job data, initializing memory, processing tasks, and saving memory state back to Redis.

## Properties

| Name           | Type   | Description                                       |
|----------------|--------|---------------------------------------------------|
| job            | Job    | The job instance that the agent is processing.    |
| defaultStages  | object | An object containing the default stages for the agent's process. |

## Methods

| Name              | Parameters        | Return Type       | Description                                                                 |
|-------------------|-------------------|-------------------|-----------------------------------------------------------------------------|
| getRedisKey       | groupId: number   | string            | Generates a Redis key using the provided group ID.                          |
| initializeMemory  | job: Job          | Promise<void>     | Abstract method to initialize memory state for the agent.                   |
| process           | -                 | Promise<void>     | Abstract method to process the agent's tasks.                               |
| setup             | job: Job          | Promise<void>     | Sets up the agent with the provided job and initializes memory if available.|
| saveMemory        | -                 | Promise<void>     | Saves the current memory state to Redis.                                    |

## Examples

```typescript
// Example usage of BaseProcessingAgent is not provided as it is an abstract class and cannot be instantiated directly.
```