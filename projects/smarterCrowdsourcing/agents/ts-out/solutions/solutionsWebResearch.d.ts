import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { CreateSearchQueriesAgent } from "./create/createSearchQueries.js";
import { RankSearchQueriesAgent } from "./ranking/rankSearchQueries.js";
import { SearchWebAgent } from "./web/searchWeb.js";
import { RankSearchResultsAgent } from "./ranking/rankSearchResults.js";
import { SmarterCrowdsourcingGetWebPagesAgent } from "./web/getWebPages.js";
export declare class SolutionsWebResearchAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_solutions_web_research";
    process(): Promise<void>;
    setupMemoryIfNeeded(): Promise<void>;
    get processors(): ({
        processor: typeof CreateSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof RankSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof SearchWebAgent;
        weight: number;
    } | {
        processor: typeof RankSearchResultsAgent;
        weight: number;
    } | {
        processor: typeof SmarterCrowdsourcingGetWebPagesAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=solutionsWebResearch.d.ts.map