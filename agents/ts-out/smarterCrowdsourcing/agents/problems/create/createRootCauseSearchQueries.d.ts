import { RootCausesSmarterCrowdsourcingAgent } from "../../scBaseRootCausesAgent.js";
export declare class CreateRootCausesSearchQueriesAgent extends RootCausesSmarterCrowdsourcingAgent {
    generateInLanguage: string | undefined;
    static rootCauseWebPageTypesArray: PSRootCauseWebPageTypes[];
    renderCreatePrompt(searchResultType: PSRootCauseWebPageTypes): Promise<PsModelMessage[]>;
    renderRefinePrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[]): Promise<PsModelMessage[]>;
    renderRankPrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]): Promise<PsModelMessage[]>;
    createRootCauseSearchQueries(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createRootCauseSearchQueries.d.ts.map