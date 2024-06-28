import { PolicySynthOperationsAgent } from "../../../base/operationsAgent.js";
import { Worker } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { RankWebRootCausesProcessor } from "./ranking/rankWebRootCauses.js";
import { RateWebRootCausesProcessor } from "./ranking/rateWebRootCauses.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { GetRefinedRootCausesProcessor } from "./web/old/getRefinedRootCauses.js";
import { RankRootCausesSearchQueriesProcessor } from "./ranking/rankRootCausesSearchQueries.js";
import { RankRootCausesSearchResultsProcessor } from "./ranking/rankRootCausesSearchResults.js";
export class ProblemsAgent extends PolicySynthOperationsAgent {
    job;
    async process() {
        if (this.job.data.type === "rootCauses") {
            await this.processRootCauses();
        }
        else {
            await this.processProblemsFlow();
        }
    }
    async processRootCauses() {
        const processors = [
            { processor: CreateRootCausesSearchQueriesProcessor, weight: 10 },
            { processor: RankRootCausesSearchQueriesProcessor, weight: 10 },
            { processor: SearchWebForRootCausesProcessor, weight: 20 },
            { processor: GetRootCausesWebPagesProcessor, weight: 20 },
            { processor: RankWebRootCausesProcessor, weight: 10 },
            { processor: RateWebRootCausesProcessor, weight: 10 },
            { processor: GetRefinedRootCausesProcessor, weight: 10 },
            { processor: RankRootCausesSearchResultsProcessor, weight: 10 }
        ];
        let totalProgress = 0;
        for (let i = 0; i < processors.length; i++) {
            const { processor: Processor, weight } = processors[i];
            const startProgress = totalProgress;
            const endProgress = totalProgress + weight;
            const processorInstance = new Processor(this.job, this.memory, startProgress, endProgress);
            await processorInstance.process();
            totalProgress = endProgress;
            await this.updateMemoryStatus(totalProgress, `${Processor.name} completed`);
        }
    }
    async processProblemsFlow() {
        const processors = [
            { processor: CreateProblemStatementImageProcessor, weight: 10 },
            { processor: CreateSubProblemsProcessor, weight: 15 },
            { processor: CreateEntitiesProcessor, weight: 10 },
            { processor: RankEntitiesProcessor, weight: 10 },
            { processor: RankSubProblemsProcessor, weight: 10 },
            { processor: CreateSubProblemImagesProcessor, weight: 15 },
            { processor: CreateSearchQueriesProcessor, weight: 10 },
            { processor: RankSearchQueriesProcessor, weight: 10 },
            { processor: SearchWebForRootCausesProcessor, weight: 10 }
        ];
        let totalProgress = 0;
        for (let i = 0; i < processors.length; i++) {
            const { processor: Processor, weight } = processors[i];
            const startProgress = totalProgress;
            const endProgress = totalProgress + weight;
            const processorInstance = new Processor(this.job, this.memory, startProgress, endProgress);
            await processorInstance.process();
            totalProgress = endProgress;
            await this.updateMemoryStatus(totalProgress, `${Processor.name} completed`);
        }
    }
    async setup() {
        const redisConfig = {
            host: "localhost",
            port: 6379,
        };
        new Worker(PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS, async (job) => {
            console.log(`Agent Problems Processing job ${job.id}`);
            const agent = new ProblemsAgent();
            await agent.setup(job);
            await agent.process();
            return job.data;
        }, {
            connection: redisConfig,
            concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
        });
    }
}
//# sourceMappingURL=problemsAgent.js.map