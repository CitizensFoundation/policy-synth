import { BaseProblemSolvingAgent } from "../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateRootCausesSearchQueriesProcessor extends BaseProblemSolvingAgent {
    generateInLanguage: string | undefined;
    static rootCauseWebPageTypesArray: PSRootCauseWebPageTypes[];
    renderCreatePrompt(searchResultType: PSRootCauseWebPageTypes): Promise<(SystemMessage | HumanMessage)[]>;
    renderRefinePrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderRankPrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    createRootCauseSearchQueries(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createRootCauseSearchQueries.d.ts.map