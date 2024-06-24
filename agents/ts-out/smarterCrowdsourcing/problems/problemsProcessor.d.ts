import { BaseAgentProcessor } from "../../base/baseAgentProcessor.js";
export declare class AgentProblemsProcessor extends BaseAgentProcessor {
    memory: PsSmarterCrowdsourcingMemoryData;
    setStage(stage: PsScMemoryStageTypes): Promise<void>;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=problemsProcessor.d.ts.map