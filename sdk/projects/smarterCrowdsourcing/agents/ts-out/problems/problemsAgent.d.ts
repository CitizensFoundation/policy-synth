import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
export declare class ProblemsAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_problems_preperation";
    process(): Promise<void>;
    setupMemoryIfNeeded(): Promise<void>;
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