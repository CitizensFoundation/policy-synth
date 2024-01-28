import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class CreateSolutionsProcessor extends BaseProlemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    renderRefinePrompt(results: IEngineSolution[], generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): Promise<(SystemMessage | HumanMessage)[]>;
    renderCreateSystemMessage(): SystemMessage;
    renderCreateForTestTokens(subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): (SystemMessage | HumanMessage)[];
    renderCreatePrompt(generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions?: string | undefined): Promise<(SystemMessage | HumanMessage)[]>;
    createSolutions(subProblemIndex: number, generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, alreadyCreatedSolutions?: string | undefined, stageName?: PsMemoryStageTypes): Promise<IEngineSolution[]>;
    randomSearchQueryIndex(searchQueries: IEngineSearchQueries, type: IEngineWebPageTypes): number;
    getAllTypeQueries(searchQueries: IEngineSearchQueries, subProblemIndex: number | undefined): {
        general: string;
        scientific: string;
        openData: string;
        news: string;
    };
    getRandomSearchQueryForType(type: IEngineWebPageTypes, problemStatementQueries: IEngineSearchQuery, subProblemQueries: IEngineSearchQuery, otherSubProblemQueries: IEngineSearchQuery, randomEntitySearchQueries: IEngineSearchQuery): string;
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
    renderRawSearchResults(rawSearchResults: IEngineWebPageGraphQlResults): {
        searchResults: string;
        selectedUrl: string;
    };
    searchForType(subProblemIndex: number, type: IEngineWebPageTypes, searchQuery: string, tokensLeftForType: number): Promise<{
        searchResults: string;
        selectedUrl: string;
    }>;
    getSearchQueryTextContext(subProblemIndex: number, searchQuery: string, type: IEngineWebPageTypes, alreadyCreatedSolutions?: string | undefined): Promise<{
        searchResults: string;
        selectedUrl: string;
    }>;
    createAllSeedSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSolutions.d.ts.map