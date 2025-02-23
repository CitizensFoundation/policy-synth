import { JobDescriptionAnalysisAgent } from "./analysisAgent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * A specialized subclass that handles multi-level job descriptions.
 * If a JobDescription has .multiLevelJob = true, then we:
 *  1) Use a new sub-agent to split that JobDescription into multiple sub-levels,
 *     returning an array of new JobDescription objects (one per level).
 *  2) For each sub-level, we run the same chain of analysis sub-agents as in the parent class.
 *  3) We add those new sub-level JobDescriptions to memory.
 *  4) We export only those sub-level JobDescriptions to Google Sheets.
 */
export declare class JobDescriptionMultiLevelAnalysisAgent extends JobDescriptionAnalysisAgent {
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    private updateMultiLevelJobDataFromJson;
    /**
     * Main process method override that first checks for multi-level job descriptions,
     * splits them, runs the analysis for each level, and then exports those newly created
     * sub-level descriptions to Google Sheets.
     */
    process(): Promise<void>;
    private splitMultiLevelJobDescription;
}
//# sourceMappingURL=multiLevelAnalysisAgent.d.ts.map