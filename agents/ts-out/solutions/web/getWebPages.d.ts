import { Page } from "puppeteer";
import { Browser } from "puppeteer-extra";
import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class GetWebPagesProcessor extends BaseProlemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    totalPagesSave: number;
    renderScanningPrompt(problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number): (HumanMessage | SystemMessage)[];
    getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{
        totalTokenCount: number;
        promptTokenCount: {
            totalCount: number;
            countPerMessage: number[];
        };
    }>;
    getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string;
    mergeAnalysisData(data1: IEngineWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData, data2: IEngineWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData): IEngineWebPageAnalysisData | PSEvidenceRawWebPageData | PSRootCauseRawWebPageData;
    isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean;
    splitText(fullText: string, maxChunkTokenCount: number, subProblemIndex: number | undefined): string[];
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<IEngineWebPageAnalysisData>;
    getTextAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<IEngineWebPageAnalysisData>;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void | PSRefinedRootCause[]>;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined): Promise<boolean>;
    processSubProblems(browser: Browser): Promise<void>;
    processEntities(subProblemIndex: number, searchQueryType: IEngineWebPageTypes, browserPage: Page): Promise<void>;
    getUrlsToFetch(allPages: IEngineSearchResultItem[]): string[];
    processProblemStatement(searchQueryType: IEngineWebPageTypes, browserPage: Page): Promise<void>;
    getAllCustomSearchUrls(browserPage: Page): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getWebPages.d.ts.map