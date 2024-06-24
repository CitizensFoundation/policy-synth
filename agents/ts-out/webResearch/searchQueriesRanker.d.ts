import { BasePairwiseRankingsProcessor } from "../base/basePairwiseRanking.js";
export declare class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    searchQuestion: string | undefined;
    constructor(memory: PsSmarterCrowdsourcingMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], searchQuestion: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map