/**
 * subAgents/generateFullReportAgent.ts
 *
 * Sub-agent #2: Takes all participation data and generates a single summary report in Markdown.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class GenerateFullReportAgent extends PolicySynthAgent {
    memory: ParticipationDataAnalysisMemory;
    constructor(agent: PsAgent, memory: ParticipationDataAnalysisMemory, startProgress: number, endProgress: number);
    /**
     * Generate a single summary (Markdown) about all items in memory.participationDataItems,
     * including their themes and sentiments.
     */
    process(): Promise<void>;
}
//# sourceMappingURL=generateFullReportAgent.d.ts.map