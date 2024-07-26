import { Queue } from "bullmq";
import ioredis from "ioredis";
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
const myQueue = new Queue("agent-problems");
const projectId = process.argv[2];
if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const output = await redis.get(redisKey);
    const memory = JSON.parse(output);
    //memory.currentStage = "create-root-causes-search-queries"
    //memory.currentStage = "rank-root-causes-search-queries"
    //memory.currentStage = "web-search-root-causes"
    //memory.currentStage = "rank-root-causes-search-results"
    //memory.currentStage = "web-get-root-causes-pages"
    memory.currentStage = "create-problem-statement-image";
    //memory.currentStage = "create-sub-problems";
    //memory.currentStage = "rank-sub-problems";
    //memory.currentStage = "reduce-sub-problems";
    //memory.currentStage = "rank-sub-problems";
    //memory.currentStage = "create-sub-problem-images";
    //memory.currentStage = "create-entities";
    //memory.currentStage = "rank-entities";
    //memory.currentStage = "create-search-queries";
    //memory.currentStage = "rank-search-queries";
    // OLD
    //memory.currentStage = "rank-web-root-causes"
    //memory.currentStage = "rate-web-root-causes"
    //memory.currentStage = "web-get-refined-root-causes"
    await redis.set(redisKey, JSON.stringify(memory));
    console.log("Adding job to queue");
    await myQueue.add("agent-problems", {
        groupId: projectId,
        communityId: 1,
        domainId: 1,
    }, { removeOnComplete: true, removeOnFail: true });
    console.log("After adding job to queue");
    process.exit(0);
}
else {
    console.log("Usage: node runProblemStage <projectId>");
    process.exit(0);
}
//# sourceMappingURL=runProblemStage.js.map