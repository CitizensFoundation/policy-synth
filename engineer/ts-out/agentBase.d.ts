import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export declare abstract class PsEngineerAgentBase extends PolicySynthAgent {
    memory: PsEngineerMemoryData;
    currentStartTime: Date | undefined;
    startTiming(): void;
    addTimingResult(agentName: string): Promise<void>;
}
//# sourceMappingURL=agentBase.d.ts.map