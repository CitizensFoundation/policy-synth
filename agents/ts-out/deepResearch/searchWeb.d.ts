import { PolicySynthAgentBase } from "../base/agentBase.js";
export declare class BaseSearchWebAgent extends PolicySynthAgentBase {
    seenUrls: Map<string, Set<string>>;
    callSearchApi(query: string, numberOfResults: number): Promise<PsSearchResultItem[]>;
    getQueryResults(queriesToSearch: string[], id: string, numberOfResults?: number): Promise<{
        searchResults: PsSearchResultItem[];
    }>;
}
//# sourceMappingURL=searchWeb.d.ts.map