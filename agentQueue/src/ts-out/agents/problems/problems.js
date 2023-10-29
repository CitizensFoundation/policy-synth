import { BaseAgent } from "../baseAgent.js";
import { Worker } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { RankSearchResultsProcessor } from "./ranking/rankSearchResults.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { RankWebRootCausesProcessor } from "./ranking/rankWebRootCauses.js";
import { RateWebRootCausesProcessor } from "./ranking/rateWebRootCauses.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { GetRefinedRootCausesProcessor } from "./web/getRefinedRootCauses.js";
export class AgentProblems extends BaseAgent {
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
                    },
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
            case "create-root-causes-search-queries":
                const createRootCausesSearchQueriesProcessor = new CreateRootCausesSearchQueriesProcessor(this.job, this.memory);
                await createRootCausesSearchQueriesProcessor.process();
                break;
            case "web-search-root-causes":
                const searchWebForRootCausesProcessor = new SearchWebForRootCausesProcessor(this.job, this.memory);
                await searchWebForRootCausesProcessor.process();
                break;
            case "web-get-root-causes-pages":
                const getRootCausesWebpagesProcessor = new GetRootCausesWebPagesProcessor(this.job, this.memory);
                await getRootCausesWebpagesProcessor.process();
                break;
            case "rank-web-root-causes":
                const rankWebRootCausesProcessor = new RankWebRootCausesProcessor(this.job, this.memory);
                await rankWebRootCausesProcessor.process();
                break;
            case "rate-web-root-causes":
                const rateWebRootCausesProcessor = new RateWebRootCausesProcessor(this.job, this.memory);
                await rateWebRootCausesProcessor.process();
                break;
            case "web-get-refined-root-causes":
                const webGetRefinedRootCausesProcessor = new GetRefinedRootCausesProcessor(this.job, this.memory);
                await webGetRefinedRootCausesProcessor.process();
                break;
            // case "get-metadata-for-top-root-causes":=
            //   const getMetadataForTopRootCauses = new GetMetaDataForTopWebRootCausesProcessor(this.job, this.memory);
            //   await getMetadataForTopRootCauses.process();
            //   break;
            case "create-sub-problems":
                await this.processSubProblems();
                break;
            case "create-entities":
                const createEntitiesProcessor = new CreateEntitiesProcessor(this.job, this.memory);
                await createEntitiesProcessor.process();
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
            case "rank-entities":
                const rankEntitiesProcessor = new RankEntitiesProcessor(this.job, this.memory);
                await rankEntitiesProcessor.process();
                break;
            case "rank-search-queries":
                const rankSearchQueriesProcessor = new RankSearchQueriesProcessor(this.job, this.memory);
                await rankSearchQueriesProcessor.process();
                break;
            case "rank-search-results":
                const rankSearchResultsProcessor = new RankSearchResultsProcessor(this.job, this.memory);
                await rankSearchResultsProcessor.process();
                break;
            case "rank-sub-problems":
                const rankSubProblemsProcessor = new RankSubProblemsProcessor(this.job, this.memory);
                await rankSubProblemsProcessor.process();
                break;
            default:
                console.log("No stage matched");
        }
    }
}
const agent = new Worker("agent-problems", async (job) => {
    console.log(`Agent Problems Processing job ${job.id}`);
    const agent = new AgentProblems();
    await agent.setup(job);
    await agent.process();
    return job.data;
}, { concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") });
process.on("SIGINT", async () => {
    await agent.close();
});
