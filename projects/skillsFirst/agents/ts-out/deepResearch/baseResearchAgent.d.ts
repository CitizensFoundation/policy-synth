import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare abstract class BaseDeepResearchAgent extends PolicySynthAgent {
    useDebugCache: boolean;
    debugCache: string[] | undefined;
    debugCacheVersion: string;
    memory: JobDescriptionMemoryData;
    defaultModelSize: PsAiModelSize;
    abstract searchInstructions: string;
    abstract rankingInstructions: string;
    abstract scanningSystemPrompt: string;
    abstract scanType: DeepResearchWebResearchTypes;
    abstract attributeNameToUseForDedup: string;
    abstract licenseType: string;
    disableRanking: boolean;
    skipScanning: boolean;
    findOrganizationUrlsAndLogos: boolean;
    filterOutNonCompetitors: boolean;
    useSmallModelForSearchResultsRanking: boolean;
    statusPrefix: string;
    urlToCrawl: string | undefined;
    convertFromCamelCaseToReadable(dataType: string): string;
    private static readonly CONCURRENCY_LIMIT;
    doWebResearch(licenseType: string, config: any, //WebResearchConfig,
    dataType?: string | undefined, statusPrefix?: string): Promise<any[]>;
}
//# sourceMappingURL=baseResearchAgent.d.ts.map