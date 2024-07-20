import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthSimpleAgentBase } from "@policysynth/agents/base/simpleAgent.js";
export declare class RootCauseWebPageVectorStore extends PolicySynthSimpleAgentBase {
    static fieldsToExtract: string;
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    postWebPage(webPageAnalysis: PSRootCauseRawWebPageData): Promise<unknown>;
    updateWebPage(id: string, webPageAnalysis: PSRootCauseRawWebPageData): Promise<unknown>;
    updateWebRootCause(id: string, rootCauseType: string, rootCauses: string[], quiet?: boolean): Promise<unknown>;
    saveWebPageMetadata(id: string, metadata: PSWebPageMetadata, quiet?: boolean): Promise<unknown>;
    updateRefinedAnalysis(id: string, refinedRootCause: PSRefinedRootCause, quiet?: boolean): Promise<unknown>;
    updateScores(id: string, scores: PSRootCauseRating, quiet?: boolean): Promise<unknown>;
    getWebPage(id: string): Promise<PSRootCauseRawWebPageData>;
    getTopPagesForProcessing(groupId: number, searchType: string | undefined, limit?: number): Promise<PSRootCauseWebPageGraphQlResults>;
    getTopWebPagesForProcessing(groupId: number, searchType?: string | undefined, limit?: number, offset?: number, rootCauseCountLimit?: number | undefined, onlyRefined?: boolean): Promise<PSRootCauseWebPageGraphQlResults>;
    getWebPagesForProcessing(groupId: number, searchType?: string | undefined, limit?: number, offset?: number, rootCauseCountLimit?: number | undefined): Promise<PSRootCauseWebPageGraphQlResults>;
    webPageExist(groupId: number, url: string, searchType: PSRootCauseWebPageTypes): Promise<Boolean>;
    searchWebPages(query: string, groupId: number | undefined, searchType: PSRootCauseWebPageTypes | undefined): Promise<PSRootCauseWebPageGraphQlResults>;
}
//# sourceMappingURL=rootCauseWebPage.d.ts.map