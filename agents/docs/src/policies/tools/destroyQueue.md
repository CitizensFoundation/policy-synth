# DestroyQueue

This script is used to manage and clean up a BullMQ queue named "agent-policies". It performs various cleaning operations on the queue and then exits the process.

## Properties

| Name      | Type   | Description               |
|-----------|--------|---------------------------|
| myQueue   | Queue  | The BullMQ queue instance. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| drain      | -                 | Promise<void> | Drains the queue, removing all jobs. |
| clean      | grace: number, limit: number, type: string | Promise<number> | Cleans jobs from the queue based on their state. |
| obliterate | -                 | Promise<void> | Completely removes the queue and all its jobs. |

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-policies");

await myQueue.drain();
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");
await myQueue.obliterate();

process.exit(0);
```

This script demonstrates how to use the BullMQ `Queue` class to perform various cleaning operations on a queue named "agent-policies". It drains the queue, cleans jobs in different states, and then obliterates the queue before exiting the process.