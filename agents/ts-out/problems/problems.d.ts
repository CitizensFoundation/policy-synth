import { BaseAgentProcessor } from "../baseAgentProcessor.js";
export declare class AgentProblems extends BaseAgentProcessor {
    memory: PsBaseMemoryData;
    setStage(stage: PsMemoryStageTypes): Promise<void>;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=problems.d.ts.map