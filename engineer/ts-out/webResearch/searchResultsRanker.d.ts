import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class SearchResultsRanker extends BasePairwiseRankingsProcessor {
    instructions: string | undefined;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankSearchResults(queriesToRank: IEngineSearchResultItem[], instructions: string, maxPrompts?: number): Promise<IEngineSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map