import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateRootCausesSearchQueriesProcessor extends BaseProblemSolvingAgent {
    static rootCauseWebPageTypesArray: PSRootCauseWebPageTypes[];
    renderCreatePrompt(searchResultType: PSRootCauseWebPageTypes): Promise<(SystemMessage | HumanMessage)[]>;
    renderRefinePrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderRankPrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    createRootCauseSearchQueries(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createRootCauseSearchQueries.d.ts.map