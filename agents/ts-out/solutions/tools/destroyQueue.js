import { Queue } from "bullmq";
const myQueue = new Queue("agent-solutions");
await myQueue.drain();
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");
await myQueue.obliterate();
//await redis.del("st_mem:1:id");
process.exit(0);
//# sourceMappingURL=destroyQueue.js.map