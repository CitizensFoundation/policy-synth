import ioredis from "ioredis";
​
const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);
​
const main = async () => {
  const projectId = process.argv[2];
​
  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const currentProject =  JSON.parse(await redis.get(redisKey) || "") as PsSmarterCrowdsourcingMemoryData;
​
    const foundDescriptions = new Set<string>();
    const newSubProblems: PsSubProblem[] = [];
    let duplicateCount = 0;
    currentProject.subProblems.forEach((subProblem) => {
      if (!foundDescriptions.has(subProblem.description)) {
        newSubProblems.push(subProblem);
        foundDescriptions.add(subProblem.description);
      } else {
        duplicateCount++;
      }
    });
​
    currentProject.subProblems = newSubProblems;
    await redis.set(redisKey, JSON.stringify(currentProject));
​
    console.log(`Sub problems deduped successfully with ${duplicateCount} duplicates removed`);
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