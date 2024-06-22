import { BasePairwiseRankingsProcessor } from "../../base/basePairwiseRanking.js";
export declare class RankEntitiesProcessor extends BasePairwiseRankingsProcessor {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankEntities.d.ts.map