import { Page } from "puppeteer";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { GetRootCausesWebPagesProcessor } from "./getRootCausesWebPages.js";
export declare class GetRefinedRootCausesProcessor extends GetRootCausesWebPagesProcessor {
    renderRootCauseScanningPrompt(type: PSRootCauseWebPageTypes, text: string): (HumanMessage | SystemMessage)[];
    getRootCauseRefinedTextAnalysis(type: PSRootCauseWebPageTypes, text: string, url: string): Promise<PSRefinedRootCause[]>;
    getRefinedRootCauseTextAIAnalysis(type: PSRootCauseWebPageTypes, text: string): Promise<PSRefinedRootCause[]>;
    mergeRefinedAnalysisData(data1: PSRefinedRootCause, data2: PSRefinedRootCause): PSRefinedRootCause;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<any>;
    getAndProcessRootCausePage(url: string, browserPage: Page, type: PSRootCauseWebPageTypes): Promise<boolean>;
    refineWebRootCauses(page: Page): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getRefinedRootCauses.d.ts.map