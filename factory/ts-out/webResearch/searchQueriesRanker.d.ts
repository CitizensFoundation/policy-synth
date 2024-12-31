import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    instructions: string | undefined;
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], instructions: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map