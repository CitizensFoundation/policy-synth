# destroyQueue

This script demonstrates the process of draining and cleaning a queue of tasks using the `bullmq` library, and then completely obliterating the queue. It is designed to remove tasks in various states such as active, failed, completed, waiting, and delayed before obliterating the queue entirely.

## Methods

No methods are defined in this script as it is a standalone script utilizing the `bullmq` library's `Queue` class methods.

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-problems");

// Drain the queue
await myQueue.drain();

// Clean the queue of tasks in various states
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

This example demonstrates how to use the `bullmq` library to manage a queue named "agent-problems". It includes draining the queue, cleaning tasks in various states, and finally obliterating the queue. This script is useful for clearing out a queue as part of maintenance or teardown processes.