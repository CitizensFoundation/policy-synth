/// <reference path="../../../src/types.d.ts" />
import { Page } from "puppeteer";
import { Browser } from "puppeteer-extra";
import { GetRootCausesWebPagesProcessor } from "./getRootCausesWebPages.js";
export declare class GetMetaDataForTopWebRootCausesProcessor extends GetRootCausesWebPagesProcessor {
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessPdf(subProblemIndex: number | undefined, url: string, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessHtml(subProblemIndex: number | undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | PSEvidenceWebPageTypes | PSRootCauseWebPageTypes, entityIndex: number | undefined, policy?: PSPolicy | undefined): Promise<void>;
    getAndProcessRootCausePage(url: string, browserPage: Page, type: PSRootCauseWebPageTypes): Promise<boolean>;
    refineWebRootCauses(page: Page): Promise<void>;
    processSubProblems(browser: Browser): Promise<void>;
    getAllPages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=getMetaDataForTopWebRootCauses.d.ts.map