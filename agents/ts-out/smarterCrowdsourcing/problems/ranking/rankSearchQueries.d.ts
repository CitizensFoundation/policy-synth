import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../pairwiseAgent.js";
export declare class RankSearchQueriesProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    renderProblemDetail(additionalData: {
        subProblemIndex: number;
        currentEntity?: PsAffectedEntity;
        searchQueryType?: PsWebPageTypes;
        searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }): string;
    voteOnPromptPair(index: number, promptPair: number[], additionalData: {
        currentEntity?: PsAffectedEntity;
        searchQueryType?: PsWebPageTypes;
        subProblemIndex: number;
        searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }): Promise<PsPairWiseVoteResults>;
    processSubProblems(): Promise<void>;
    getQueryIndex(searchQueryType: PsWebPageTypes): 3 | 2 | 4 | 6 | 5;
    processEntities(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSearchQueries.d.ts.map