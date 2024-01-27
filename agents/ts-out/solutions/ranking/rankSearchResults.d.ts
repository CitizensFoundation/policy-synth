import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankSearchResultsProcessor extends BasePairwiseRankingsProcessor {
    subProblemIndex: number;
    entitiesIndex: number;
    currentEntity: IEngineAffectedEntity;
    searchResultType: IEngineWebPageTypes;
    searchResultTarget: IEngineWebPageTargets;
    renderProblemDetail(): string;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    processSubProblems(searchResultType: IEngineWebPageTypes): Promise<void>;
    processEntities(subProblemIndex: number, searchResultType: IEngineWebPageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSearchResults.d.ts.map