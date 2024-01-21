# Queue

The `Queue` class from the `bullmq` library is used to create and manage a queue of jobs. It provides various methods to interact with the queue, such as adding jobs, draining the queue, cleaning jobs in different states, and completely obliterating the queue.

## Properties

This class instance does not explicitly define properties in the provided code snippet. Properties would typically be defined in the `bullmq` library's `Queue` class definition.

## Methods

| Name       | Parameters                  | Return Type | Description                                      |
|------------|-----------------------------|-------------|--------------------------------------------------|
| drain      | -                           | Promise<void> | Drains the queue, removing all jobs.             |
| clean      | grace: number, limit: number, status: 'active' \| 'failed' \| 'completed' \| 'wait' \| 'delayed' | Promise<number[]> | Cleans jobs from the queue based on their status and other parameters. |
| obliterate | -                           | Promise<void> | Completely obliterates the queue, removing all data related to it. |

## Examples

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-problems");

// Drain the queue, removing all jobs
await myQueue.drain();

// Clean jobs in various states with a grace period and limit
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue, removing all data related to it
await myQueue.obliterate();

// Exit the process
process.exit(0);
```

Please note that the actual implementation and properties of the `Queue` class would be more extensive than what is shown in the snippet. The snippet only demonstrates the usage of some methods available in the `Queue` class. For complete documentation, one should refer to the official `bullmq` documentation.