import { Page, Browser } from "puppeteer";
import { GetRootCausesWebPagesAgent } from "./getRootCausesWebPages.js";
export declare class GetMetaDataForTopWebRootCausesAgent extends GetRootCausesWebPagesAgent {
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: PsWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessRootCausePage(url: string, browserPage: Page, type: PSRootCauseWebPageTypes): Promise<boolean>;
    refineWebRootCauses(page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getMetaDataForTopWebRootCauses.d.ts.map