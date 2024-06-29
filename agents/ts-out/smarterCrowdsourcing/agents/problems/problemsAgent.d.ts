import { Job } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class ProblemsAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    get agentQueueName(): "smarter_crowdsourcing_problems_preperation";
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateProblemStatementImageProcessor;
        weight: number;
    } | {
        processor: typeof CreateSubProblemsProcessor;
        weight: number;
    } | {
        processor: typeof CreateEntitiesProcessor;
        weight: number;
    } | {
        processor: typeof RankEntitiesProcessor;
        weight: number;
    } | {
        processor: typeof CreateSubProblemImagesProcessor;
        weight: number;
    })[];
}
//# sourceMappingURL=problemsAgent.d.ts.map