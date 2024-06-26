import { SimplePairwiseRankingsAgent } from "../base/simplePairwiseRanking.js";
export declare class SearchResultsRanker extends SimplePairwiseRankingsAgent {
    searchQuestion: string | undefined;
    constructor(memory: PsSimpleAgentMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchResults(queriesToRank: PsSearchResultItem[], searchQuestion: string, maxPrompts?: number): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map