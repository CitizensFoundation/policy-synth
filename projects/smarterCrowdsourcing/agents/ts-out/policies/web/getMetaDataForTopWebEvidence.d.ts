import { Page, Browser } from "puppeteer";
import { GetEvidenceWebPagesAgent } from "./getEvidenceWebPages.js";
export declare class GetMetaDataForTopWebEvidenceAgent extends GetEvidenceWebPagesAgent {
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessEvidencePage(subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy): Promise<boolean>;
    refineWebEvidence(policy: PSPolicy, subProblemIndex: number, page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getMetaDataForTopWebEvidence.d.ts.map