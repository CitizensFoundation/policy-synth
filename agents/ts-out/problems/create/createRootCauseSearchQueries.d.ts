import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateRootCausesSearchQueriesProcessor extends BaseProlemSolvingAgent {
    static rootCauseWebPageTypesArray: PSRootCauseWebPageTypes[];
    renderCreatePrompt(searchResultType: PSRootCauseWebPageTypes): Promise<(HumanMessage | SystemMessage)[]>;
    renderRefinePrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[]): Promise<(HumanMessage | SystemMessage)[]>;
    renderRankPrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]): Promise<(HumanMessage | SystemMessage)[]>;
    createRootCauseSearchQueries(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createRootCauseSearchQueries.d.ts.map