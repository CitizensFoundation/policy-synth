import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../pairwiseAgent.js";
export declare class RankSearchResultsProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    subProblemIndex: number;
    entitiesIndex: number;
    currentEntity: PsAffectedEntity;
    searchResultType: PsWebPageTypes;
    searchResultTarget: PsWebPageTargets;
    renderProblemDetail(): string;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblems(searchResultType: PsWebPageTypes): Promise<void>;
    processEntities(subProblemIndex: number, searchResultType: PsWebPageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSearchResults.d.ts.map