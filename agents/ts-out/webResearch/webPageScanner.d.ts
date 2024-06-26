import { Page } from "puppeteer";
import { BaseGetWebPagesAgent } from "./getWebPages.js";
export declare class WebPageScanner extends BaseGetWebPagesAgent {
    jsonSchemaForResults: string | undefined;
    systemPromptOverride: string | undefined;
    collectedWebPages: any[];
    progressFunction: Function | undefined;
    constructor(memory: PsSimpleAgentMemoryData);
    renderScanningPrompt(problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number): PsModelMessage[];
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<PsWebPageAnalysisData>;
    getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void | PSRefinedRootCause[]>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined): Promise<boolean>;
    scan(listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string | undefined, progressFunction?: Function | undefined): Promise<any[]>;
}
//# sourceMappingURL=webPageScanner.d.ts.map