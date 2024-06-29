import { Job } from "bullmq";
import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class ProblemsAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    get agentQueueName(): "smarter_crowdsourcing_problems_preperation";
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateProblemStatementImageAgent;
        weight: number;
    } | {
        processor: typeof CreateSubProblemsAgent;
        weight: number;
    } | {
        processor: typeof CreateEntitiesAgent;
        weight: number;
    } | {
        processor: typeof RankEntitiesAgent;
        weight: number;
    } | {
        processor: typeof CreateSubProblemImagesAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=problemsAgent.d.ts.map