import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
export declare class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    searchQuestion: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], searchQuestion: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map