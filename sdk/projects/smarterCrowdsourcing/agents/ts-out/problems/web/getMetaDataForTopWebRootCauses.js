import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import metascraperFactory from "metascraper";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo";
import metascraperClearbit from "metascraper-clearbit";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import ioredis from "ioredis";
import { GetRootCausesWebPagesAgent } from "./getRootCausesWebPages.js";
import axios from "axios";
import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync } from "fs";
const gzip = promisify(createGzip);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
//TODO: Look into this
//@ts-ignore
const metascraper = metascraperFactory([
    metascraperAuthor(),
    metascraperDate(),
    metascraperDescription(),
    metascraperImage(),
    metascraperLogo(),
    metascraperClearbit(),
    metascraperPublisher(),
    metascraperTitle(),
    metascraperUrl(),
]);
//@ts-ignore
puppeteer.use(StealthPlugin());
export class GetMetaDataForTopWebRootCausesAgent extends GetRootCausesWebPagesAgent {
    async processPageText(text, subProblemIndex, url, type, entityIndex, policy = undefined) {
        this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url} for ${type} search results`);
        try {
            const metadata = await metascraper({ html: text, url });
            const metadataToSave = {
                metaDate: metadata.date,
                metaDescription: metadata.description,
                metaImageUrl: metadata.image,
                //@ts-ignore
                metaLogoUrl: metadata.logo,
                metaPublisher: metadata.publisher,
                metaTitle: metadata.title,
                metaAuthor: metadata.author,
            };
            this.logger.debug(`Got metadata ${JSON.stringify(metadataToSave, null, 2)}`);
            // TODO: need to access vectorStoreId some other way (policy always undefined)
            await this.rootCauseWebPageVectorStore.saveWebPageMetadata(policy?.vectorStoreId, metadataToSave);
        }
        catch (e) {
            this.logger.error(`Error in processPageText`);
            this.logger.error(e.stack || e);
        }
    }
    async getAndProcessPdf(subProblemIndex, url, type, entityIndex, policy = undefined) {
        return new Promise(async (resolve, reject) => {
            this.logger.info("getAndProcessPdf");
            try {
                let finalText = "";
                let pdfBuffer;
                const filePath = `webPagesCache/${this.memory.groupId}/${encodeURIComponent(url)}.gz`;
                if (existsSync(filePath)) {
                    this.logger.info("Got cached PDF");
                    const cachedPdf = await readFileAsync(filePath);
                    pdfBuffer = gunzipSync(cachedPdf);
                }
                else {
                    const sleepingForMs = this.minSleepBeforeBrowserRequest +
                        Math.random() * this.maxAdditionalRandomSleepBeforeBrowserRequest;
                    this.logger.info(`Fetching PDF ${url} in ${sleepingForMs} ms`);
                    await new Promise((r) => setTimeout(r, sleepingForMs));
                    const axiosResponse = await axios.get(url, {
                        responseType: "arraybuffer",
                    });
                    pdfBuffer = axiosResponse.data;
                    if (pdfBuffer) {
                        this.logger.debug(`Caching PDF response`);
                        const gzipData = gzipSync(pdfBuffer);
                        await writeFileAsync(filePath, gzipData);
                        this.logger.debug("Have cached PDF response");
                    }
                }
                if (pdfBuffer) {
                    finalText = pdfBuffer.toString();
                    await this.processPageText(finalText, subProblemIndex, url, type, entityIndex, policy);
                    resolve();
                }
                else {
                    this.logger.error(`No PDF buffer`);
                    resolve();
                }
            }
            catch (e) {
                this.logger.error(`Error in get pdf`);
                this.logger.error(e);
                resolve();
            }
        });
    }
    async getAndProcessHtml(subProblemIndex = undefined, url, browserPage, type, entityIndex, policy = undefined) {
        try {
            let finalText, htmlText;
            this.logger.debug(`Getting HTML for ${url}`);
            const filePath = `webPagesCache/${this.memory.groupId}/${encodeURIComponent(url)}.gz`;
            if (existsSync(filePath)) {
                this.logger.info("Got cached HTML");
                const cachedData = await readFileAsync(filePath);
                htmlText = gunzipSync(cachedData).toString();
            }
            else {
                const sleepingForMs = this.minSleepBeforeBrowserRequest +
                    Math.random() * this.maxAdditionalRandomSleepBeforeBrowserRequest;
                this.logger.info(`Fetching HTML page ${url} in ${sleepingForMs} ms`);
                await new Promise((r) => setTimeout(r, sleepingForMs));
                const response = await browserPage.goto(url, {
                    waitUntil: "networkidle0",
                });
                if (response) {
                    htmlText = await response.text();
                    if (htmlText) {
                        this.logger.debug(`Caching response`);
                        const gzipData = gzipSync(Buffer.from(htmlText));
                        await writeFileAsync(filePath, gzipData);
                    }
                }
            }
            if (htmlText) {
                finalText = htmlText;
                //this.logger.debug(`Got HTML text: ${finalText}`);
                await this.processPageText(finalText, subProblemIndex, url, type, entityIndex, policy);
            }
            else {
                this.logger.error(`No HTML text found for ${url}`);
            }
        }
        catch (e) {
            this.logger.error(`Error in get html`);
            this.logger.error(e.stack || e);
        }
    }
    async getAndProcessRootCausePage(url, browserPage, type) {
        if (url.toLowerCase().endsWith(".pdf")) {
            await this.getAndProcessPdf(-1, url, type, undefined, undefined);
        }
        else {
            await this.getAndProcessHtml(-1, url, browserPage, type, undefined, undefined);
        }
        return true;
    }
    async refineWebRootCauses(page) {
        const limit = 10;
        try {
            for (const rootCauseType of this.rootCauseFieldTypes) {
                const searchType = this.simplifyEvidenceType(rootCauseType);
                const results = await this.rootCauseWebPageVectorStore.getTopPagesForProcessing(this.memory.groupId, searchType, limit);
                this.logger.debug(`Got ${results.data.Get["RootCauseWebPage"].length} WebPage results from Weaviate`);
                if (results.data.Get["RootCauseWebPage"].length === 0) {
                    this.logger.error(`No results for ${searchType}`);
                    continue;
                }
                let pageCounter = 0;
                for (const retrievedObject of results.data.Get["RootCauseWebPage"]) {
                    const webPage = retrievedObject;
                    const id = webPage._additional.id;
                    this.logger.info(`Score ${webPage.totalScore} for ${webPage.url}`);
                    this.logger.debug(`All scores ${webPage.rootCauseRelevanceToProblemStatementScore} ${webPage.rootCauseRelevanceToTypeScore} ${webPage.rootCauseConfidenceScore} ${webPage.rootCauseQualityScore}`);
                    await this.getAndProcessRootCausePage(webPage.url, page, searchType);
                    this.logger.info(`(+${pageCounter++}) - ${id} - Updated`);
                }
            }
        }
        catch (error) {
            this.logger.error(error.stack || error);
            throw error;
        }
    }
    async processSubProblems(browser) {
        this.logger.info("Refining root causes");
        const newPage = await browser.newPage();
        newPage.setDefaultTimeout(this.webPageNavTimeout);
        newPage.setDefaultNavigationTimeout(this.webPageNavTimeout);
        await newPage.setUserAgent(this.currentUserAgent);
        try {
            await this.refineWebRootCauses(newPage);
            this.logger.debug("Finished refining root causes");
        }
        catch (error) {
            this.logger.error(error.stack || error);
            throw error;
        }
    }
    async getAllPages() {
        const browser = await puppeteer.launch({ headless: true });
        this.logger.debug("Launching browser");
        const browserPage = await browser.newPage();
        browserPage.setDefaultTimeout(this.webPageNavTimeout);
        browserPage.setDefaultNavigationTimeout(this.webPageNavTimeout);
        await browserPage.setUserAgent(this.currentUserAgent);
        await this.processSubProblems(browser);
        await this.saveMemory();
        await browser.close();
        this.logger.info("Browser closed");
    }
    async process() {
        this.logger.info("Get Web Meta Data Agent");
        super.process();
        await this.getAllPages();
        this.logger.info(`Refined ${this.totalPagesSave} pages`);
        this.logger.info("Get Web Meta Data Agent Complete");
    }
}
//# sourceMappingURL=getMetaDataForTopWebRootCauses.js.map