import { Page, Browser } from "puppeteer";
import { GetEvidenceWebPagesProcessor } from "./getEvidenceWebPages.js";
export declare class GetMetaDataForTopWebEvidenceProcessor extends GetEvidenceWebPagesProcessor {
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | PSEvidenceWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessEvidencePage(subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy): Promise<boolean>;
    refineWebEvidence(policy: PSPolicy, subProblemIndex: number, page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getMetaDataForTopWebEvidence.d.ts.map