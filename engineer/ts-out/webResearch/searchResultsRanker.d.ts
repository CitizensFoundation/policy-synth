import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SearchResultsRanker extends PairwiseRankingAgent {
    instructions: string | undefined;
    memory: PsEngineerMemoryData;
    defaultModelSize: PsAiModelSize;
    numberOfMatchesForEachPrompt: number;
    updatePrefix: string;
    /**
     * The constructor now accepts additional parameters:
     * - agent: The agent instance (of type PsAgent)
     * - memory: Your memory data (of type PsEngineerMemoryData)
     * - progressFunction: Optional progress callback
     * - startProgress / endProgress: Bounds for progress tracking
     * - useSmallModelForSearchResultsRanking: Flag that when true switches to a small model and increases match count
     */
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number, useSmallModelForSearchResultsRanking?: boolean);
    /**
     * Compares two search result items.
     * The system message is constructed using helper functions and follows a similar template as the first example.
     */
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    /**
     * Sets up the ranking prompts based on the number of search results, performs the pairwise ranking,
     * saves memory, and returns the ordered list.
     */
    rankSearchResults(queriesToRank: PsSearchResultItem[], instructions: string): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map