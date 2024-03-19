import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    rankInstructions: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankItems(itemsToRank: string[], rankInstructions: string): Promise<string[]>;
}
//# sourceMappingURL=stageOneRanker.d.ts.map