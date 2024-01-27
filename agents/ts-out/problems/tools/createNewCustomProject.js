import ioredis from "ioredis";
import { PolicySynthAgentBase } from "../../baseAgent.js";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const projectId = process.argv[2];
const force = process.argv[3];
if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const problemStatement = ``;
    const currentProject = await redis.get(`st_mem:${projectId}:id`);
    if (currentProject && !force) {
        console.error("Project already exists, use force as second parameter to overwrite");
        process.exit(1);
    }
    else if (!currentProject || (currentProject && force)) {
        const project = {
            redisKey: redisKey,
            groupId: parseInt(projectId),
            communityId: 2,
            domainId: 1,
            stage: "create-sub-problems",
            currentStage: "create-sub-problems",
            stages: PolicySynthAgentBase.emptyStages,
            timeStart: Date.now(),
            totalCost: 0,
            customInstructions: {},
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
        };
        await redis.set(redisKey, JSON.stringify(project));
    }
    console.log("Project created");
    process.exit(0);
}
else {
    console.log("Usage: node createNewCustomProject <projectId>");
    process.exit(1);
}
//# sourceMappingURL=createNewCustomProject.js.map