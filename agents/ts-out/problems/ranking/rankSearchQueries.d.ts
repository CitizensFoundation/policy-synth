import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankSearchQueriesProcessor extends BasePairwiseRankingsProcessor {
    renderProblemDetail(additionalData: {
        subProblemIndex: number;
        currentEntity?: IEngineAffectedEntity;
        searchQueryType?: IEngineWebPageTypes;
        searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }): string;
    voteOnPromptPair(index: number, promptPair: number[], additionalData: {
        currentEntity?: IEngineAffectedEntity;
        searchQueryType?: IEngineWebPageTypes;
        subProblemIndex: number;
        searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }): Promise<IEnginePairWiseVoteResults>;
    processSubProblems(): Promise<void>;
    getQueryIndex(searchQueryType: IEngineWebPageTypes): 3 | 2 | 5 | 4 | 6;
    processEntities(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSearchQueries.d.ts.map