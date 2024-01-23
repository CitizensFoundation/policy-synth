import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
export declare class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    progressFunction: Function | undefined;
    constructor(progressFunction?: Function | undefined);
    searchQuestion: string | undefined;
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], searchQuestion: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map