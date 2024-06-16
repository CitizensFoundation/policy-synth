import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Page } from "puppeteer";
import { GetWebPagesProcessor } from "@policysynth/agents/solutions/web/getWebPages.js";
export declare class WebPageScanner extends GetWebPagesProcessor {
    memory: PsEngineerMemoryData;
    scanType?: PsEngineerWebResearchTypes;
    instructions: string;
    collectedWebPages: any[];
    constructor(memory: PsEngineerMemoryData, instructions: string);
    sanitizeInput(text: string): string;
    renderScanningPrompt(problemStatement: PsProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number): (SystemMessage | HumanMessage)[];
    getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{
        totalTokenCount: number;
        promptTokenCount: {
            totalCount: number;
            countPerMessage: never[];
        };
    }>;
    getAIAnalysis(text: string, subProblemIndex?: number, entityIndex?: number): Promise<any>;
    getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void | PSRefinedRootCause[]>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined): Promise<boolean>;
    scan(listOfUrls: string[], scanType: PsEngineerWebResearchTypes): Promise<any[]>;
}
//# sourceMappingURL=webPageScanner.d.ts.map