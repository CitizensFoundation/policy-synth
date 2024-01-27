# Queue

The `Queue` class from the `bullmq` package is used to manage job queues. This example demonstrates how to drain and clean queues of different job states and finally obliterate the queue.

## Methods

| Name       | Parameters                        | Return Type | Description                                                                 |
|------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| drain      |                                   | Promise<void> | Drains the queue, removing all jobs.                                        |
| clean      | grace: number, limit: number, status: 'active' \| 'failed' \| 'completed' \| 'wait' \| 'delayed' | Promise<Job[]> | Cleans jobs in the queue based on their status, grace time, and limit.      |
| obliterate |                                   | Promise<void> | Completely removes the queue and all of its data.                           |

## Example

```javascript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-problems");

// Drain the queue
await myQueue.drain();

// Clean the queue based on job status
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue
await myQueue.obliterate();

// Exit the process
process.exit(0);
```

This example is part of a script located at `@policysynth/agents/problems/tools/destroyQueue.js` and demonstrates how to manage a job queue by draining, cleaning, and obliterating it using the `bullmq` package.