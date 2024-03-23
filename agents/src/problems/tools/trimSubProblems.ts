import { Queue } from "bullmq";
import ioredis from "ioredis";
​
const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);
​
const main = async () => {
  const projectId = process.argv[2];
  const newLength = process.argv[3];
​
  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const currentProject =  JSON.parse(await redis.get(redisKey) || "") as PsBaseMemoryData;
​
    // trim this.memory.subProblems with newLength
    currentProject.subProblems = currentProject.subProblems.slice(0, parseInt(newLength));
​
    await redis.set(redisKey, JSON.stringify(currentProject));
    console.log("Project trimmed successfully");
    process.exit(0);
  } else {
    console.error("Project id is required");
    process.exit(1);
  }
};
​
main().catch(err => {
  console.error(err);
  process.exit(1);
});