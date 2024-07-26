import { Page, Browser } from "puppeteer";
import { SmarterCrowdsourcingGetWebPagesAgent } from "../../solutions/web/getWebPages.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class GetRootCausesWebPagesAgent extends SmarterCrowdsourcingGetWebPagesAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    hasPrintedPrompt: boolean;
    outputInLanguage: string | undefined;
    processesUrls: Set<string>;
    renderRootCauseScanningPrompt(type: PSRootCauseWebPageTypes, text: string): PsModelMessage[];
    getRootCauseTokenCount(text: string, type: PSRootCauseWebPageTypes): Promise<{
        totalTokenCount: number;
        promptTokenCount: number;
    }>;
    getRootCauseTextAnalysis(type: PSRootCauseWebPageTypes, text: string, url: string): Promise<PSRootCauseRawWebPageData | PSRefinedRootCause[]>;
    getRootCauseAIAnalysis(type: PSRootCauseWebPageTypes, text: string): Promise<PSRefinedRootCause[]>;
    isUrlInSubProblemMemory(url: string): boolean;
    processPageText(text: string, subProblemIndex: undefined, url: string, type: PsWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: undefined): Promise<void>;
    getAndProcessRootCausePage(url: string, browserPage: Page, type: PSRootCauseWebPageTypes): Promise<boolean>;
    processRootCauses(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getRootCausesWebPages.d.ts.map