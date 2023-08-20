import { Queue } from "bullmq";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const myQueue = new Queue("agent-innovation");
const projectId = process.argv[2];
if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const output = await redis.get(redisKey);
    const memory = JSON.parse(output);
    memory.currentStage = "policies-seed";
    await redis.set(redisKey, JSON.stringify(memory));
    console.log("Adding job to queue");
    await myQueue.add("agent-policies", {
        groupId: projectId,
        communityId: 1,
        domainId: 1,
    }, { removeOnComplete: true, removeOnFail: true });
    console.log("After adding job to queue");
    process.exit(0);
}
else {
    console.log("Usage: node runInnovationStage <projectId>");
    process.exit(0);
}
