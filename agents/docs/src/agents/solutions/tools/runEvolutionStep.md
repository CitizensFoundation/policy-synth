# Queue

A Queue is a robust queue for handling jobs and messages in Node.js.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| name          | string | The name of the queue.    |

## Methods

| Name       | Parameters                                    | Return Type | Description                 |
|------------|-----------------------------------------------|-------------|-----------------------------|
| constructor| name: string, opts?: QueueOptions, connection?: ConnectionOptions | Queue | Initializes a new Queue instance with a given name, optional settings, and connection options. |
| add        | name: string, data: any, opts?: JobsOptions   | Promise<Job> | Adds a new job to the queue. |
| close      | -                                             | Promise<void> | Closes the queue, disconnecting from the Redis server. |

# Job

Represents a job in the queue.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| id            | string | The unique identifier for the job. |

## Methods

| Name             | Parameters                                    | Return Type | Description                 |
|------------------|-----------------------------------------------|-------------|-----------------------------|
| constructor      | name: string, data: any, opts?: JobsOptions   | Job         | Creates a new Job instance. |
| waitUntilFinished| queueEvents: QueueEvents, ttl?: number        | Promise<any> | Waits for the job to be completed or failed. |

# QueueEvents

QueueEvents allows you to listen to various events emitted by the queue.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| name          | string | The name of the queue for which to listen to events. |

## Methods

| Name             | Parameters                                    | Return Type | Description                 |
|------------------|-----------------------------------------------|-------------|-----------------------------|
| constructor      | name: string, opts?: QueueEventsOptions       | QueueEvents | Initializes a new QueueEvents instance to listen for events on a given queue. |

# IEngineInnovationMemoryData

Interface representing the memory data structure for an innovation engine.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| currentStage  | IEngineStageTypes | The current stage of the innovation process. |

# IEngineStageTypes

Type representing the various stages of the innovation engine process.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| stages        | string[] | An array of stage identifiers for the innovation process. |

## Examples

```typescript
// Example usage of the Queue
const myQueue = new Queue("agent-solutions");

// Example usage of adding a job to the Queue
const job = await myQueue.add(
  "agent-innovation",
  { groupId: projectId, communityId: projectId, domainId: 1 },
  { removeOnComplete: true, removeOnFail: true }
);

// Example usage of QueueEvents
const queueEvents = new QueueEvents("agent-solutions");

// Example usage of Job waitUntilFinished method
const result = await job.waitUntilFinished(queueEvents);

// Example usage of IEngineInnovationMemoryData
const memory: IEngineInnovationMemoryData = {
  currentStage: "evolve-create-population"
};

// Example usage of IEngineStageTypes
const stages: IEngineStageTypes = [
  "evolve-create-population",
  "evolve-reap-population",
  // ... other stages
];
```

Please note that the above code is a simplified example and may not cover all aspects of the actual implementation. The actual usage may require handling more properties and methods, as well as additional error checking and event handling.