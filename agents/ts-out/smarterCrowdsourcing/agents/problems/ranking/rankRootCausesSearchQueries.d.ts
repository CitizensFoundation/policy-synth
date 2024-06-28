import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../scPairwiseAgent.js";
export declare class RankRootCausesSearchQueriesProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    rootCauseTypes: string[];
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankRootCausesSearchQueries.d.ts.map