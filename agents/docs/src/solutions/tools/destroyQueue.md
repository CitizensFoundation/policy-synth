# Queue

The `Queue` class from the `bullmq` library is used to manage job queues. This script demonstrates how to drain and clean different states of a queue, and finally obliterate it.

## Methods

| Name       | Parameters                  | Return Type | Description                                         |
|------------|-----------------------------|-------------|-----------------------------------------------------|
| drain      | -                           | Promise<void> | Drains the queue, removing all jobs.               |
| clean      | grace: number, limit: number, status: string | Promise<void> | Cleans jobs from the queue based on their status.  |
| obliterate | -                           | Promise<void> | Completely removes the queue and all its data.     |

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-solutions");

// Drain the queue
await myQueue.drain();

// Clean the queue by different statuses
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue
await myQueue.obliterate();

process.exit(0);
```

This script is part of the `@policysynth/agents/solutions/tools/destroyQueue.js` module.