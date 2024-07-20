import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthSimpleAgentBase } from "@policysynth/agents/base/simpleAgent.js";
export declare class EvidenceWebPageVectorStore extends PolicySynthSimpleAgentBase {
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    postWebPage(webPageAnalysis: PSEvidenceRawWebPageData): Promise<unknown>;
    updateWebPage(id: string, webPageAnalysis: PSEvidenceRawWebPageData): Promise<unknown>;
    updateWebSolutions(id: string, evidenceType: string, evidence: string[], quiet?: boolean): Promise<unknown>;
    saveWebPageMetadata(id: string, metadata: PSWebPageMetadata, quiet?: boolean): Promise<unknown>;
    updateRefinedAnalysis(id: string, refinedEvidence: PSRefinedPolicyEvidence, quiet?: boolean): Promise<unknown>;
    updateScores(id: string, scores: PSPolicyRating, quiet?: boolean): Promise<unknown>;
    getWebPage(id: string): Promise<PSEvidenceRawWebPageData>;
    getTopPagesForProcessing(groupId: number, subProblemIndex: number | undefined | null, policyTitle: string | undefined, searchType: string | undefined, limit?: number): Promise<PSEvidenceWebPageGraphQlResults>;
    getTopWebPagesForProcessing(groupId: number, subProblemIndex: number | undefined | null, searchType: string | undefined, policyTitle: string | undefined, limit?: number, offset?: number, evidenceCountLimit?: number | undefined, onlyRefined?: boolean): Promise<PSEvidenceWebPageGraphQlResults>;
    getWebPagesForProcessing(groupId: number, subProblemIndex: number | undefined | null, searchType: string | undefined, policyTitle: string | undefined, limit?: number, offset?: number, evidenceCountLimit?: number | undefined): Promise<PSEvidenceWebPageGraphQlResults>;
    webPageExist(groupId: number, url: string, searchType: PSEvidenceWebPageTypes, subProblemIndex: number | undefined, entityIndex: number | undefined): Promise<Boolean>;
    searchWebPages(query: string, groupId: number | undefined, subProblemIndex: number | undefined, searchType: PSEvidenceWebPageTypes | undefined): Promise<PSEvidenceWebPageGraphQlResults>;
}
//# sourceMappingURL=evidenceWebPage.d.ts.map