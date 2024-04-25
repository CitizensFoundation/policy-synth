import { WeaviateClient } from 'weaviate-ts-client';
import { PolicySynthAgentBase } from "../../baseAgent.js";
export declare abstract class BaseVectorStoreClient extends PolicySynthAgentBase {
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    postWebPage(webPageAnalysis: IEngineWebPageAnalysisData): Promise<unknown>;
    updateWebPage(id: string, webPageAnalysis: IEngineWebPageAnalysisData): Promise<unknown>;
    updateWebSolutions(id: string, webSolutions: string[], quiet?: boolean): Promise<unknown>;
    getWebPage(id: string): Promise<IEngineWebPageAnalysisData>;
    getWebPagesForProcessing(groupId: number, subProblemIndex: number | null | undefined, entityIndex: number | null | undefined, searchType: IEngineSearchQueries | undefined, limit?: number, offset?: number, solutionCountLimit?: number | undefined): Promise<IEngineWebPageGraphQlResults>;
    webPageExist(groupId: number, url: string, searchType: IEngineWebPageTypes, subProblemIndex: number | undefined, entityIndex: number | undefined): Promise<Boolean>;
    searchWebPages(query: string, groupId: number | undefined, subProblemIndex: number | undefined, searchType: IEngineWebPageTypes | undefined, filterOutEmptySolutions?: boolean): Promise<IEngineWebPageGraphQlResults>;
}
//# sourceMappingURL=baseVectorStoreClient.d.ts.map