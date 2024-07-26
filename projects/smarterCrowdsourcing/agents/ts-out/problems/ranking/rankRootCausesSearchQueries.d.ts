import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankRootCausesSearchQueriesAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    disableRelativeProgress: boolean;
    rootCauseTypes: string[];
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankRootCausesSearchQueries.d.ts.map