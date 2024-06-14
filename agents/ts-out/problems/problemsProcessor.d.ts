import { BaseAgentProcessor } from "../baseAgentProcessor.js";
export declare class AgentProblemsProcessor extends BaseAgentProcessor {
    memory: PsBaseMemoryData;
    setStage(stage: PsMemoryStageTypes): Promise<void>;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=problemsProcessor.d.ts.map