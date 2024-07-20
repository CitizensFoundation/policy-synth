import { Page } from "puppeteer";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class BaseGetWebPagesAgent extends PolicySynthSimpleAgentBase {
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
    isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean;
    splitText(fullText: string, maxChunkTokenCount: number, subProblemIndex: number | undefined): string[];
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<any>;
    getTextAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<any[]>;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: any, //TODO: Use <T>
    entityIndex: number | undefined, policy?: any | undefined): Promise<void | any[]>;
    generateFileName(url: string): string;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: any, //TODO: Use <T>
    entityIndex: number | undefined, policy?: any | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: any, //TODO: Use <T>
    entityIndex: number | undefined, policy?: any | undefined): Promise<void>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: any, //TODO: Use <T>
    entityIndex: number | undefined): Promise<boolean>;
    getUrlsToFetch(allPages: PsSearchResultItem[]): string[];
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getWebPages.d.ts.map