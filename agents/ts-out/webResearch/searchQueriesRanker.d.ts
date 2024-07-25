import { SimplePairwiseRankingsAgent } from "../base/simplePairwiseRanking.js";
export declare class SearchQueriesRanker extends SimplePairwiseRankingsAgent {
    searchQuestion: string | undefined;
    constructor(memory: PsSimpleAgentMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], searchQuestion: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map