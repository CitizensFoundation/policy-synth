import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthSimpleAgentBase } from "@policysynth/agents/base/simpleAgent.js";
export declare class WebPageVectorStore extends PolicySynthSimpleAgentBase {
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    postWebPage(webPageAnalysis: PsWebPageAnalysisData): Promise<unknown>;
    updateWebPage(id: string, webPageAnalysis: PsWebPageAnalysisData): Promise<unknown>;
    deleteWebSolution(id: string, quiet?: boolean): Promise<void>;
    updateWebSolutions(id: string, webSolutions: string[], quiet?: boolean): Promise<unknown>;
    getWebPage(id: string): Promise<PsWebPageAnalysisData>;
    getWebPagesForProcessing(groupId: number, subProblemIndex: number | undefined | null, entityIndex: number | undefined | null, searchType: PsSearchQueries | undefined, limit?: number, offset?: number, solutionCountLimit?: number | undefined): Promise<PsWebPageGraphQlResults>;
    webPageExist(groupId: number, url: string, searchType: PsWebPageTypes, subProblemIndex: number | undefined, entityIndex: number | undefined): Promise<Boolean>;
    searchWebPages(query: string, groupId: number | undefined, subProblemIndex: number | undefined, searchType: PsWebPageTypes | undefined, filterOutEmptySolutions?: boolean): Promise<PsWebPageGraphQlResults>;
}
//# sourceMappingURL=webPage.d.ts.map