import { AgentProblemsProcessor } from "./problemsProcessor.js";
export declare class ProblemsAgent extends AgentProblemsProcessor {
    memory: PsBaseMemoryData;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
    setup(): Promise<void>;
}
//# sourceMappingURL=problemsAgent.d.ts.map