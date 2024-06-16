import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class CreateSolutionsVectorStoreProcessor extends BaseProblemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    useLanguage: string | undefined;
    renderRefinePrompt(results: PsSolution[], generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): Promise<(HumanMessage | SystemMessage)[]>;
    renderCreateSystemMessage(): SystemMessage;
    renderCreateForTestTokens(subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): (HumanMessage | SystemMessage)[];
    renderCreatePrompt(generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): Promise<(HumanMessage | SystemMessage)[]>;
    createSolutions(subProblemIndex: number, generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, alreadyCreatedSolutions?: string | undefined, stageName?: PsMemoryStageTypes): Promise<PsSolution[]>;
    randomSearchQueryIndex(searchQueries: PsSearchQueries, type: PsWebPageTypes): number;
    getAllTypeQueries(searchQueries: PsSearchQueries, subProblemIndex: number | undefined): {
        general: string;
        scientific: string;
        openData: string;
        news: string;
    };
    getRandomSearchQueryForType(type: PsWebPageTypes, problemStatementQueries: PsSearchQuery, subProblemQueries: PsSearchQuery, otherSubProblemQueries: PsSearchQuery, randomEntitySearchQueries: PsSearchQuery): string;
    getSearchQueries(subProblemIndex: number): {
        scientific: string;
        general: string;
        openData: string;
        news: string;
    };
    getTextContext(subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): Promise<{
        general: {
            searchResults: string;
            selectedUrl: string;
        };
        scientific: {
            searchResults: string;
            selectedUrl: string;
        };
        openData: {
            searchResults: string;
            selectedUrl: string;
        };
        news: {
            searchResults: string;
            selectedUrl: string;
        };
    }>;
    getWeightedRandomSolution<T>(array: T[]): "" | T;
    countTokensForString(text: string): Promise<number>;
    getRandomItemFromArray<T>(array: T[], useTopN?: number | undefined): "" | T;
    renderRawSearchResults(rawSearchResults: PsWebPageGraphQlResults): {
        searchResults: string;
        selectedUrl: string;
    };
    searchForType(subProblemIndex: number, type: PsWebPageTypes, searchQuery: string, tokensLeftForType: number): Promise<{
        searchResults: string;
        selectedUrl: string;
    }>;
    getSearchQueryTextContext(subProblemIndex: number, searchQuery: string, type: PsWebPageTypes, alreadyCreatedSolutions?: string | undefined): Promise<{
        searchResults: string;
        selectedUrl: string;
    }>;
    createAllSeedSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSolutionsVectorStore.d.ts.map