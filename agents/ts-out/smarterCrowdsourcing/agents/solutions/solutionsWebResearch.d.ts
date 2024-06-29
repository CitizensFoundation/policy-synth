import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class SolutionsWebResearchAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_solutions_web_research";
    process(): Promise<void>;
    get processors(): {
        processor: any;
        weight: number;
    }[];
}
//# sourceMappingURL=solutionsWebResearch.d.ts.map