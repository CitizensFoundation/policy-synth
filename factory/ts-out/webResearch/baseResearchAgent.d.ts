import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare abstract class PsAgentFactoryBaseWebResearchAgent extends PolicySynthScAgentBase {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    maxTopContentResultsToUse: number;
    useDebugCache: boolean;
    debugCache: string[] | undefined;
    debugCacheVersion: string;
    abstract searchInstructions: string;
    abstract scanType: PsAgentFactoryWebResearchTypes;
    doWebResearch(): Promise<any[] | undefined>;
}
//# sourceMappingURL=baseResearchAgent.d.ts.map