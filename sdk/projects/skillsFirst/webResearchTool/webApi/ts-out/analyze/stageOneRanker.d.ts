import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class StageOneRanker extends BasePairwiseRankingsProcessor {
    rankInstructions: string | undefined;
    constructor(memory?: PsSmarterCrowdsourcingMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankItems(itemsToRank: string[], rankInstructions?: string | undefined): Promise<string[]>;
}
//# sourceMappingURL=stageOneRanker.d.ts.map