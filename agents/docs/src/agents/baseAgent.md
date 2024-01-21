# BaseAgent

Abstract class that serves as a base for agents that interact with a Redis database and process jobs.

## Properties

| Name           | Type   | Description                               |
|----------------|--------|-------------------------------------------|
| job            | Job    | The current job being processed.          |
| defaultStages  | object | A collection of default stages for agents.|

## Methods

| Name             | Parameters        | Return Type       | Description                                             |
|------------------|-------------------|-------------------|---------------------------------------------------------|
| getRedisKey      | groupId: number   | string            | Generates a Redis key based on the provided group ID.    |
| initializeMemory | job: Job          | Promise<void>     | Abstract method to initialize memory for the agent.     |
| process          |                   | Promise<void>     | Abstract method to process the job.                     |
| setup            | job: Job          | Promise<void>     | Sets up the agent with the given job and initializes memory. |
| saveMemory       |                   | Promise<void>     | Saves the current state of memory to Redis.             |

## Examples

```typescript
// Example usage of the BaseAgent class is not provided as it is an abstract class.
```