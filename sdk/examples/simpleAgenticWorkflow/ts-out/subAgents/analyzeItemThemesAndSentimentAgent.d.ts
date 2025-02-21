/**
 * subAgents/analyzeItemThemesAndSentimentAgent.ts
 *
 * Sub-agent #1: Analyzes each participation data item for theme & sentiment.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class AnalyzeItemThemesAndSentimentAgent extends PolicySynthAgent {
    memory: ParticipationDataAnalysisMemory;
    get reasoningEffort(): "low" | "medium" | "high";
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: ParticipationDataAnalysisMemory, startProgress: number, endProgress: number);
    /**
     * Analyzes each item in memory.participationDataItems for:
     *  - Theme classification
     *  - Sentiment analysis
     */
    process(): Promise<void>;
}
//# sourceMappingURL=analyzeItemThemesAndSentimentAgent.d.ts.map