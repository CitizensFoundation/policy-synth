import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
export declare class SearchResultsRanker extends BasePairwiseRankingsProcessor {
    searchQuestion: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchResults(queriesToRank: PsSearchResultItem[], searchQuestion: string, maxPrompts?: number): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map