import { Page, Browser } from "puppeteer";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GetWebPagesProcessor } from "../../solutions/web/getWebPages.js";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class GetEvidenceWebPagesProcessor extends GetWebPagesProcessor {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    renderEvidenceScanningPrompt(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): (HumanMessage | SystemMessage)[];
    getEvidenceTokenCount(text: string, subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes): Promise<{
        totalTokenCount: number;
        promptTokenCount: {
            totalCount: number;
            countPerMessage: number[];
        };
    }>;
    getEvidenceTextAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSEvidenceRawWebPageData | PSRefinedPolicyEvidence>;
    getEvidenceAIAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSEvidenceRawWebPageData>;
    mergeAnalysisData(data1: PSEvidenceRawWebPageData, data2: PSEvidenceRawWebPageData): PSEvidenceRawWebPageData;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    get maxTopWebPagesToGet(): number;
    getAndProcessEvidencePage(subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy): Promise<boolean>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getEvidenceWebPages.d.ts.map