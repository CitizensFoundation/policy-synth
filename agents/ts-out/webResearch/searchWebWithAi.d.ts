import { PolicySynthAgent } from "../base/agent.js";
import { PsAgent } from "../dbModels/agent.js";
export declare class BaseSearchWebAgentWithAi extends PolicySynthAgent {
    seenUrls: Map<string, Set<string>>;
    constructor(agent: PsAgent, memory: PsAgentMemoryData);
    callSearchApi(query: string, numberOfResults: number): Promise<PsSearchResultItem[]>;
    getQueryResults(queriesToSearch: string[], id: string, numberOfResults?: number): Promise<{
        searchResults: PsSearchResultItem[];
    }>;
}
//# sourceMappingURL=searchWebWithAi.d.ts.map