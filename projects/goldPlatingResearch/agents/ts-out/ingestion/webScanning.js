import puppeteer from "puppeteer-extra";
import { BaseGetWebPagesOperationsAgent } from "@policysynth/agents/webResearch/getWebPagesOperations.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import { PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class WebScanningAgent extends BaseGetWebPagesOperationsAgent {
    modelSize = PsAiModelSize.Small;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(researchItem) {
        const urlsToScan = this.collectUrls(researchItem);
        await this.scan(urlsToScan);
        this.updateResearchItem(researchItem);
    }
    collectUrls(researchItem) {
        const urls = [];
        if (researchItem.nationalLaw) {
            urls.push(researchItem.nationalLaw.law.url);
            if (researchItem.nationalLaw.supportArticleText) {
                urls.push(researchItem.nationalLaw.supportArticleText.url);
            }
        }
        if (researchItem.nationalRegulation) {
            urls.push(...researchItem.nationalRegulation.map((reg) => reg.url));
        }
        if (researchItem.euDirective) {
            urls.push(researchItem.euDirective.url);
        }
        if (researchItem.euRegulation) {
            urls.push(researchItem.euRegulation.url);
        }
        return urls;
    }
    async scan(listOfUrls) {
        this.logger.info("Web Pages Scanner");
        this.totalPagesSave = 0;
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
        });
        this.logger.debug("Launching browser");
        const browserPage = await browser.newPage();
        browserPage.setDefaultTimeout(PsConstants.webPageNavTimeout);
        browserPage.setDefaultNavigationTimeout(PsConstants.webPageNavTimeout);
        await browserPage.setUserAgent(PsConstants.currentUserAgent);
        for (let i = 0; i < listOfUrls.length; i++) {
            this.logger.info(`${i + 1}/${listOfUrls.length}`);
            this.logger.info(`------> Scanning ${listOfUrls[i]} <------`);
            const progress = Math.round(((i + 1) / listOfUrls.length) * 100);
            await this.updateRangedProgress(progress, `Scanning ${listOfUrls[i]}`);
            await this.getAndProcessPage(undefined, listOfUrls[i], browserPage, "law", undefined);
        }
        await browser.close();
        this.logger.info("Browser closed");
        this.logger.info(`Saved ${this.totalPagesSave} pages`);
        this.logger.info("Web Pages Scanner Complete");
    }
    async getAndProcessPage(subProblemIndex, url, browserPage, type, entityIndex) {
        if (url.toLowerCase().endsWith(".pdf") ||
            url.indexOf("files.reglugerd.is") > -1) {
            await this.getAndProcessPdf(subProblemIndex, url, type, entityIndex);
        }
        else {
            await this.getAndProcessHtml(subProblemIndex, url, browserPage, type, entityIndex);
        }
        return true;
    }
    async processPageText(text, subProblemIndex, url, type, entityIndex, policy = undefined) {
        this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url}`);
        // Store the text in memory for later use
        if (!this.memory.scannedPages) {
            this.memory.scannedPages = {};
        }
        this.memory.scannedPages[url] = text;
    }
    updateResearchItem(researchItem) {
        if (!this.memory.scannedPages) {
            this.logger.warn("No scanned pages found in memory");
            return;
        }
        if (researchItem.nationalLaw) {
            researchItem.nationalLaw.law.fullText =
                this.memory.scannedPages[researchItem.nationalLaw.law.url] || "";
            if (researchItem.nationalLaw.supportArticleText) {
                researchItem.nationalLaw.supportArticleText.fullText =
                    this.memory.scannedPages[researchItem.nationalLaw.supportArticleText.url] || "";
            }
        }
        if (researchItem.nationalRegulation) {
            researchItem.nationalRegulation.forEach((regulation) => {
                regulation.fullText = this.memory.scannedPages[regulation.url] || "";
            });
        }
        if (researchItem.euDirective) {
            researchItem.euDirective.fullText =
                this.memory.scannedPages[researchItem.euDirective.url] || "";
        }
        if (researchItem.euRegulation) {
            researchItem.euRegulation.fullText =
                this.memory.scannedPages[researchItem.euRegulation.url] || "";
        }
    }
}
//# sourceMappingURL=webScanning.js.map