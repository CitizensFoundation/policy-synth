import { BaseSearchWebAgent } from "@policysynth/agents/deepResearch/searchWeb.js";
export declare class ResearchWeb extends BaseSearchWebAgent {
    constructor(memory: PsAgentMemoryData);
    search(searchQueries: string[]): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchWeb.d.ts.map