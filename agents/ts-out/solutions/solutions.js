import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Worker } from "bullmq";
import { CreateProsConsProcessor } from "./create/createProsCons.js";
import { CreateSolutionsProcessor } from "./create/createSolutions.js";
import { RankProsConsProcessor } from "./ranking/rankProsCons.js";
import { RankSolutionsProcessor } from "./ranking/rankSolutions.js";
import { GetWebPagesProcessor } from "./web/getWebPages.js";
import { SearchWebProcessor } from "./web/searchWeb.js";
import { EvolvePopulationProcessor } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesProcessor } from "./create/createImages.js";
import { ReapSolutionsProcessor } from "./evolve/reapPopulation.js";
import { RateSolutionsProcessor } from "./ranking/rateSolutions.js";
import { GroupSolutionsProcessor } from "./group/groupSolutions.js";
import { RankWebSolutionsProcessor } from "./ranking/rankWebSolutions.js";
import { RankSearchResultsProcessor } from "./ranking/rankSearchResults.js";
import { RemoveDuplicateWebSolutions } from "./create/dedupWebSolutions.js";
export class AgentSolutions extends BaseAgentProcessor {
    async setStage(stage) {
        this.memory.currentStage = stage;
        this.memory.stages[stage].timeStart = Date.now();
        await this.saveMemory();
    }
    async process() {
        switch (this.memory.currentStage) {
            case "create-pros-cons":
                const createProsConsProcessor = new CreateProsConsProcessor(this.job, this.memory);
                await createProsConsProcessor.process();
                break;
            case "create-solution-images":
                const createSolutionImagesProcessor = new CreateSolutionImagesProcessor(this.job, this.memory);
                await createSolutionImagesProcessor.process();
                break;
            case "create-seed-solutions":
                const createSolutionsProcessor = new CreateSolutionsProcessor(this.job, this.memory);
                await createSolutionsProcessor.process();
                break;
            case "rank-pros-cons":
                const rankProsConsProcessor = new RankProsConsProcessor(this.job, this.memory);
                await rankProsConsProcessor.process();
                break;
            case "dedup-web-solutions":
                const dedup = new RemoveDuplicateWebSolutions(this.job, this.memory);
                await dedup.process();
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
            case "group-solutions":
                const groupSolutionsProcessor = new GroupSolutionsProcessor(this.job, this.memory);
                await groupSolutionsProcessor.process();
                break;
            case "web-get-pages":
                const getWebPagesProcessor = new GetWebPagesProcessor(this.job, this.memory);
                await getWebPagesProcessor.process();
                break;
            case "web-search":
                const searchWebProcessor = new SearchWebProcessor(this.job, this.memory);
                await searchWebProcessor.process();
                break;
            case "rank-search-results":
                const rankSearchResultsProcessor = new RankSearchResultsProcessor(this.job, this.memory);
                await rankSearchResultsProcessor.process();
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
const redisConfig = {
    host: "localhost",
    port: 6379,
};
const agent = new Worker("agent-solutions", async (job) => {
    console.log(`Agent Solutions Processing job ${job.id}`);
    const agent = new AgentSolutions();
    await agent.setup(job);
    await agent.process();
    return job.data;
}, {
    connection: redisConfig,
    concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1"),
});
process.on("SIGINT", async () => {
    await agent.close();
});
//# sourceMappingURL=solutions.js.map