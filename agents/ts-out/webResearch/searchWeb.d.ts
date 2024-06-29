import { PolicySynthBaseAgent } from "../base/agent.js";
export declare class BaseSearchWebAgent extends PolicySynthBaseAgent {
    seenUrls: Map<string, Set<string>>;
    callSearchApi(query: string): Promise<PsSearchResultItem[]>;
    getQueryResults(queriesToSearch: string[], id: string): Promise<{
        searchResults: PsSearchResultItem[];
    }>;
}
//# sourceMappingURL=searchWeb.d.ts.map