import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare abstract class PsEngineerBaseWebResearchAgent extends PolicySynthAgentBase {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    maxTopContentResultsToUse: number;
    useDebugCache: boolean;
    debugCache: string[] | undefined;
    abstract searchInstructions: string;
    abstract scanType: "documentation" | "codeExamples";
    doWebResearch(): Promise<any[] | undefined>;
}
//# sourceMappingURL=baseResearchAgent.d.ts.map