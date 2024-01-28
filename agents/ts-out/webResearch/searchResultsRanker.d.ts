import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
export declare class SearchResultsRanker extends BasePairwiseRankingsProcessor {
    searchQuestion: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankSearchResults(queriesToRank: IEngineSearchResultItem[], searchQuestion: string, maxPrompts?: number): Promise<IEngineSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map