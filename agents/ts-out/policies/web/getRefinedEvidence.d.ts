/// <reference path="../../../src/types.d.ts" />
import { Page } from "puppeteer";
import { Browser } from "puppeteer-extra";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GetEvidenceWebPagesProcessor } from "./getEvidenceWebPages.js";
export declare class GetRefinedEvidenceProcessor extends GetEvidenceWebPagesProcessor {
    renderEvidenceScanningPrompt(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): (HumanMessage | SystemMessage)[];
    getEvidenceTextAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSRefinedPolicyEvidence>;
    getRefinedEvidenceTextAIAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSRefinedPolicyEvidence>;
    mergeRefinedAnalysisData(data1: PSRefinedPolicyEvidence, data2: PSRefinedPolicyEvidence): PSRefinedPolicyEvidence;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessEvidencePage(subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy): Promise<boolean>;
    refineWebEvidence(policy: PSPolicy, subProblemIndex: number, page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getRefinedEvidence.d.ts.map