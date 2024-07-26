import fs from "fs/promises";
import IORedis from "ioredis";

const redis = new IORedis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

const importSubProblems = async (projectId: string, filePath: string) => {
  const redisKey = `st_mem:${projectId}:id`;

  // Read the current memory data from Redis
  const memoryDataJson = await redis.get(redisKey);
  if (!memoryDataJson) {
    throw new Error(`No memory data found for project ID ${projectId}`);
  }
  const memoryData: PsSmarterCrowdsourcingMemoryData = JSON.parse(memoryDataJson);

  // Read the new sub problems from the file
  const fileContent = await fs.readFile(filePath, "utf8");
  const newSubProblems: PsSubProblem[] = JSON.parse(fileContent);

  if (newSubProblems && newSubProblems.length > 0) {
    // Update the subProblems with the new data and the boilerplate structure
    memoryData.subProblems = newSubProblems.map((subProblemData) => ({
      title: subProblemData.title,
      description: subProblemData.description,
      whyIsSubProblemImportant: subProblemData.whyIsSubProblemImportant,
      entities: [],
      solutions: {
        populations: [],
      },
      searchQueries: {
        general: [],
        scientific: [],
        news: [],
        openData: [],
      },
      searchResults: {
        pages: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
      },
    }));
  }
  await redis.set(redisKey, JSON.stringify(memoryData));
};

const main = async () => {
  const projectId = process.argv[2];
  const filePath = process.argv[3];

  if (!projectId || !filePath) {
    console.error("Both project ID and file path are required");
    process.exit(1);
  } else {
    try {
      await importSubProblems(projectId, filePath);
      console.log("Sub problems imported successfully");
      process.exit(0);
    } catch (error) {
      console.error("Error during sub problems import:", error);
      process.exit(1);
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
