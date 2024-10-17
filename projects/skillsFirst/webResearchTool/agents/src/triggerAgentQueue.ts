import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

const myQueue = new Queue("JOB_DESCRIPTION_ANALYSIS");

console.log("Adding job to queue");
await myQueue.add(
  "start",
  {},
  { removeOnComplete: true, removeOnFail: true }
);

console.log("After adding job to queue");
process.exit(0);
