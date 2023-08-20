import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const projectId = process.argv[2];
const force = process.argv[3];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;

  const currentProject = await redis.get(`st_mem:${projectId}:id`);

  if (currentProject && !force) {
    console.error("Project already exists, use force as second parameter to overwrite");
    process.exit(1);
  } else if (!currentProject || (currentProject && force)) {

    const problemStatement = `Authoritarians who prioritize political outcomes over independent processes are using unfair and often illegal tactics, including political violence and changes to policies, procedures, and election administration that aim to change the outcome of elections. Authoritarians are using information and communication platforms to undermine belief in the integrity of elections leading, in turn, to declining trust in elections and democracy.`

    const project = {
      redisKey: redisKey,
      groupId: parseInt(projectId),
      communityId: 2,
      domainId: 1,
      stage: "create-sub-problems",
      currentStage: "create-sub-problems",
      stages: {
        "create-sub-problems": {},
        "rank-sub-problems": {},
        "policies-seed": {},
        "policies-create-images": {},
        "create-entities": {},
        "rank-entities": {},
        "create-search-queries": {},
        "create-sub-problem-images": {},
        "rank-search-queries": {},
        "web-search": {},
        "rank-web-solutions": {},
        "rate-solutions": {},
        "rank-search-results": {},
        "web-get-pages": {},
        "create-problem-statement-image": {},
        "create-seed-solutions": {},
        "create-pros-cons": {},
        "create-solution-images": {},
        "rank-pros-cons": {},
        "rank-solutions": {},
        "group-solutions": {},
        "evolve-create-population": {},
        "evolve-mutate-population": {},
        "evolve-recombine-population": {},
        "evolve-reap-population": {},
        "topic-map-solutions": {},
        "evolve-rank-population": {},
        "analyse-external-solutions": {},
        "create-evidence-search-queries": {},
        "web-get-evidence-pages": {},
        "web-search-evidence": {}
      },
      timeStart: Date.now(),
      totalCost: 0,
      customInstructions: {

      },
      problemStatement: {
        description: problemStatement,
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
          }
        },
      },
      subProblems: [],
      currentStageData: undefined,
    } as IEngineInnovationMemoryData;


    await redis.set(redisKey, JSON.stringify(project));
  }

  console.log("Project created");
  process.exit(0);
  } else {
  console.log("Usage: node createNewCustomProject <projectId>");
  process.exit(1);
}

