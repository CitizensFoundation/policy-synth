import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class SearchResultsRanker extends BasePairwiseRankingsProcessor {
    instructions: string | undefined;
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchResults(queriesToRank: PsSearchResultItem[], instructions: string, maxPrompts?: number): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map