import { Page } from "puppeteer";
import { WebPageVectorStore } from "../vectorstore/webPage.js";
import { PolicySynthOperationsAgent } from "../base/operationsAgent.js";
export declare class BaseGetWebPagesOperationsAgent extends PolicySynthOperationsAgent {
    webPageVectorStore: WebPageVectorStore;
    urlsScanned: Set<string>;
    totalPagesSave: number;
    maxModelTokensOut: number;
    modelTemperature: number;
    renderScanningPrompt(problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number): PsModelMessage[];
    getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{
        totalTokenCount: number;
        promptTokenCount: number;
    }>;
    getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string;
    mergeAnalysisData(data1: PsWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData, data2: PsWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData): PsWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData;
    isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean;
    splitText(fullText: string, maxChunkTokenCount: number, subProblemIndex: number | undefined): string[];
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<PsWebPageAnalysisData>;
    getTextAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<PsSolution[] | PsWebPageAnalysisData>;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void | PSRefinedRootCause[]>;
    generateFileName(url: string): string;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined): Promise<boolean>;
    getUrlsToFetch(allPages: PsSearchResultItem[]): string[];
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getWebPagesOperations.d.ts.map