import { Page, Browser } from "puppeteer";
import { GetEvidenceWebPagesAgent } from "./getEvidenceWebPages.js";
export declare class GetRefinedEvidenceAgent extends GetEvidenceWebPagesAgent {
    renderEvidenceScanningPrompt(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): PsModelMessage[];
    getEvidenceTextAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSRefinedPolicyEvidence>;
    getRefinedEvidenceTextAIAnalysis(subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string): Promise<PSRefinedPolicyEvidence>;
    mergeRefinedAnalysisData(data1: PSRefinedPolicyEvidence, data2: PSRefinedPolicyEvidence): PSRefinedPolicyEvidence;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy: PSPolicy): Promise<void>;
    getAndProcessEvidencePage(subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy): Promise<boolean>;
    refineWebEvidence(policyIn: PSPolicy, subProblemIndex: number, page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getRefinedEvidence.d.ts.map