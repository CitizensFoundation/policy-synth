import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare abstract class PsEngineerBaseWebResearchAgent extends PolicySynthAgentBase {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    abstract searchInstructions: string;
    abstract scanType: "documentation" | "codeExamples";
    doWebResearch(): Promise<any[] | undefined>;
}
//# sourceMappingURL=baseAgent.d.ts.map