import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-solutions");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
  //memory.currentStage = "create-problem-statement-image";
  //memory.currentStage = "create-sub-problems";
  //memory.currentStage = "create-sub-problem-images";
  //memory.currentStage = "rank-sub-problems";
  //memory.currentStage = "create-entities";
  //memory.currentStage = "rank-entities";
  //memory.currentStage = "create-search-queries";
  //memory.currentStage = "rank-search-queries";
  //memory.currentStage = "web-search";
  //memory.currentStage = "rank-search-results";
  //memory.currentStage = "web-get-pages";
  memory.currentStage = "rank-web-solutions";
  //memory.currentStage = "create-seed-solutions";
  //memory.currentStage = "create-pros-cons";
  //memory.currentStage = "rank-pros-cons";
  //memory.currentStage = "rank-solutions";

  //Repeat for each GA generation
  //memory.currentStage = "evolve-create-population";
  //memory.currentStage = "evolve-reap-population";
  //memory.currentStage = "create-pros-cons";
  //memory.currentStage = "rank-pros-cons";
  //memory.currentStage = "rate-solutions";
  //memory.currentStage = "rank-solutions";
  //memory.currentStage = "group-solutions";
  //memory.currentStage = "create-solution-images";
  //memory.currentStage = "topic-map-solutions";

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("Adding job to queue");
  await myQueue.add(
    "agent-innovation",
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
