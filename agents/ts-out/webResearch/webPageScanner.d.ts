import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Page } from "puppeteer";
import { GetWebPagesProcessor } from "../solutions/web/getWebPages.js";
export declare class WebPageScanner extends GetWebPagesProcessor {
    jsonSchemaForResults: string | undefined;
    systemPromptOverride: string | undefined;
    collectedWebPages: any[];
    progressFunction: Function | undefined;
    constructor(memory: PsBaseMemoryData);
    renderScanningPrompt(problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number): (SystemMessage | HumanMessage)[];
    getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{
        totalTokenCount: number;
        promptTokenCount: {
            totalCount: number;
            countPerMessage: never[];
        };
    }>;
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<IEngineWebPageAnalysisData>;
    getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void | PSRefinedRootCause[]>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined): Promise<boolean>;
    scan(listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string | undefined, progressFunction?: Function | undefined): Promise<any[]>;
}
//# sourceMappingURL=webPageScanner.d.ts.map