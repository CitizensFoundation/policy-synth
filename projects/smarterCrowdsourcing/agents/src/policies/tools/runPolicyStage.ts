import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-policies");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

  //memory.currentStage = "policies-seed";
  //memory.currentStage = "policies-create-images"
  //memory.currentStage = "create-evidence-search-queries"
  //memory.currentStage = "web-search-evidence";
  //memory.currentStage = "web-get-evidence-pages";
  //memory.currentStage = "rank-web-evidence";
  //memory.currentStage = "rate-web-evidence";
  //memory.currentStage = "web-get-refined-evidence";
  //memory.currentStage = "get-metadata-for-top-evidence";

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("Adding job to queue");
  await myQueue.add(
    "agent-policies",
    {
      groupId: projectId,
      communityId: 1,
      domainId: 1,
    },
    { removeOnComplete: true, removeOnFail: true }
  );

  console.log("After adding job to queue");
  process.exit(0);
} else {
  console.log("Usage: node runInnovationStage <projectId>");
  process.exit(0);
}
