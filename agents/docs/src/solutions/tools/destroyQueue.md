# DestroyQueue

This script is designed to manage and clean up a queue system for agent solutions. It utilizes the `bullmq` library to interact with the queue, performing operations such as draining the queue, cleaning specific states of jobs within the queue, and ultimately obliterating the queue.

## Methods

| Name       | Parameters                        | Return Type | Description                                                                 |
|------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| drain      | -                                 | Promise<void> | Drains the queue, removing all waiting jobs.                                |
| clean      | grace: number, limit: number, status: 'active' \| 'failed' \| 'completed' \| 'wait' \| 'delayed' | Promise<void> | Cleans jobs in a specified state that are older than the grace period.      |
| obliterate | -                                 | Promise<void> | Completely removes the queue and all of its data.                           |

## Example

```javascript
// Example usage to clean and destroy a queue with @policysynth/agents/solutions/tools/destroyQueue.js
import { Queue } from "bullmq";

const myQueue = new Queue("agent-solutions");

// Drain the queue
await myQueue.drain();

// Clean specific states of jobs within the queue
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