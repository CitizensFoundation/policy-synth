import { BaseAgent } from "../baseAgent.js";
import { Worker } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateProsConsProcessor } from "./create/createProsCons.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { CreateSolutionsProcessor } from "./create/createSolutions.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankProsConsProcessor } from "./ranking/rankProsCons.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { RankSearchResultsProcessor } from "./ranking/rankSearchResults.js";
import { RankSolutionsProcessor } from "./ranking/rankSolutions.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { GetWebPagesProcessor } from "./web/getWebPages.js";
import { SearchWebProcessor } from "./web/searchWeb.js";
import { EvolvePopulationProcessor } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesProcessor } from "./create/createImages.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { ReapSolutionsProcessor } from "./evolve/reapPopulation.js";
import { RateSolutionsProcessor } from "./ranking/rateSolutions.js";
import { GroupSolutionsProcessor } from "./group/groupSolutions.js";
import { TopicMapSolutionsProcessor } from "./group/old/topicMapSolutions.js";
import { RankWebSolutionsProcessor } from "./ranking/rankWebSolutions.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
export class AgentSolutions extends BaseAgent {
    async initializeMemory(job) {
        const jobData = job.data;
        this.memory = {
            redisKey: this.getRedisKey(jobData.groupId),
            groupId: jobData.groupId,
            communityId: jobData.communityId,
            domainId: jobData.domainId,
            currentStage: "create-sub-problems",
            stages: this.defaultStages,
            timeStart: Date.now(),
            totalCost: 0,
            customInstructions: {},
            problemStatement: {
                description: jobData.initialProblemStatement,
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
        await this.saveMemory();
    }
    async setStage(stage) {
        this.memory.currentStage = stage;
        this.memory.stages[stage].timeStart = Date.now();
        await this.saveMemory();
    }
    async processSubProblems() {
        const subProblemsProcessor = new CreateSubProblemsProcessor(this.job, this.memory);
        await subProblemsProcessor.process();
    }
    async process() {
        switch (this.memory.currentStage) {
            case "create-sub-problems":
                await this.processSubProblems();
                break;
            case "create-entities":
                const createEntitiesProcessor = new CreateEntitiesProcessor(this.job, this.memory);
                await createEntitiesProcessor.process();
                break;
            case "create-pros-cons":
                const createProsConsProcessor = new CreateProsConsProcessor(this.job, this.memory);
                await createProsConsProcessor.process();
                break;
            case "create-solution-images":
                const createSolutionImagesProcessor = new CreateSolutionImagesProcessor(this.job, this.memory);
                await createSolutionImagesProcessor.process();
                break;
            case "create-sub-problem-images":
                const createSubProblemImagesProcessor = new CreateSubProblemImagesProcessor(this.job, this.memory);
                await createSubProblemImagesProcessor.process();
                break;
            case "create-problem-statement-image":
                const createProblemStatementImageProcessor = new CreateProblemStatementImageProcessor(this.job, this.memory);
                await createProblemStatementImageProcessor.process();
                break;
            case "create-search-queries":
                const createSearchQueriesProcessor = new CreateSearchQueriesProcessor(this.job, this.memory);
                await createSearchQueriesProcessor.process();
                break;
            case "create-seed-solutions":
                const createSolutionsProcessor = new CreateSolutionsProcessor(this.job, this.memory);
                await createSolutionsProcessor.process();
                break;
            case "rank-entities":
                const rankEntitiesProcessor = new RankEntitiesProcessor(this.job, this.memory);
                await rankEntitiesProcessor.process();
                break;
            case "rank-pros-cons":
                const rankProsConsProcessor = new RankProsConsProcessor(this.job, this.memory);
                await rankProsConsProcessor.process();
                break;
            case "rank-search-queries":
                const rankSearchQueriesProcessor = new RankSearchQueriesProcessor(this.job, this.memory);
                await rankSearchQueriesProcessor.process();
                break;
            case "rank-search-results":
                const rankSearchResultsProcessor = new RankSearchResultsProcessor(this.job, this.memory);
                await rankSearchResultsProcessor.process();
                break;
            case "rank-web-solutions":
                const rankWebSolutionsProcessor = new RankWebSolutionsProcessor(this.job, this.memory);
                await rankWebSolutionsProcessor.process();
                break;
            case "rank-solutions":
                const rankSolutionsProcessor = new RankSolutionsProcessor(this.job, this.memory);
                await rankSolutionsProcessor.process();
                break;
            case "rate-solutions":
                const rateSolutionsProcessor = new RateSolutionsProcessor(this.job, this.memory);
                await rateSolutionsProcessor.process();
                break;
            case "topic-map-solutions":
                const topicMapSolutionsProcessor = new TopicMapSolutionsProcessor(this.job, this.memory);
                await topicMapSolutionsProcessor.process();
                break;
            case "group-solutions":
                const groupSolutionsProcessor = new GroupSolutionsProcessor(this.job, this.memory);
                await groupSolutionsProcessor.process();
                break;
            case "rank-sub-problems":
                const rankSubProblemsProcessor = new RankSubProblemsProcessor(this.job, this.memory);
                await rankSubProblemsProcessor.process();
                break;
            case "web-get-pages":
                const getWebPagesProcessor = new GetWebPagesProcessor(this.job, this.memory);
                await getWebPagesProcessor.process();
                break;
            case "web-search":
                const searchWebProcessor = new SearchWebProcessor(this.job, this.memory);
                await searchWebProcessor.process();
                break;
            case "evolve-create-population":
                const createPopulationProcessor = new EvolvePopulationProcessor(this.job, this.memory);
                await createPopulationProcessor.process();
                break;
            case "evolve-reap-population":
                const reapSolutionsProcessor = new ReapSolutionsProcessor(this.job, this.memory);
                await reapSolutionsProcessor.process();
                break;
            default:
                console.log("No stage matched");
        }
    }
}
const agent = new Worker("agent-solutions", async (job) => {
    console.log(`Agent Solutions Processing job ${job.id}`);
    const agent = new AgentSolutions();
    await agent.setup(job);
    await agent.process();
    return job.data;
}, { concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") });
process.on("SIGINT", async () => {
    await agent.close();
});