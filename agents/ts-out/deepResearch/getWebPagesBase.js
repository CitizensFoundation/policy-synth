import { writeFile, readFile, existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import crypto from "crypto";
import { gunzipSync, gzipSync } from "zlib";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { htmlToText } from "html-to-text";
import { PdfReader } from "pdfreader";
import { PolicySynthAgent } from "../base/agent.js";
import { FirecrawlScrapeAgent } from "./fireCrawlApi.js";
puppeteer.use(StealthPlugin());
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
export class GetWebPagesBaseAgent extends PolicySynthAgent {
    firecrawlApiKey;
    firecrawlAgent;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
        if (this.firecrawlApiKey) {
            this.firecrawlAgent = new FirecrawlScrapeAgent(agent, memory, startProgress, endProgress);
        }
    }
    generateFileName(url, suffix) {
        const hash = crypto.createHash("sha256");
        hash.update(url + suffix);
        const hashedFileName = hash.digest("hex");
        return "v2_" + hashedFileName + ".gz";
    }
    getCacheDirectory() {
        const directoryPath = `webPagesCache`;
        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true });
        }
        return directoryPath;
    }
    /**
     * Get cached data if available.
     */
    async getCachedData(url, suffix) {
        const fullPath = join(this.getCacheDirectory(), this.generateFileName(url, suffix));
        if (existsSync(fullPath) && statSync(fullPath).isFile()) {
            try {
                const cachedData = await readFileAsync(fullPath);
                const unzippedData = gunzipSync(cachedData);
                if (suffix === "markdown") {
                    return JSON.parse(unzippedData.toString());
                }
                else if (suffix === "pdf") {
                    // Return the raw binary data as a Buffer for PDF
                    return unzippedData;
                }
                else {
                    // For rawHtml or other textual data, return as string
                    return unzippedData.toString();
                }
            }
            catch (error) {
                this.logger.error(`Error parsing cached data for ${url}: ${error}`);
                return null;
            }
        }
        return null;
    }
    /**
     * Cache data.
     */
    async cacheData(url, suffix, data) {
        const fullPath = join(this.getCacheDirectory(), this.generateFileName(url, suffix));
        let dataToWrite;
        if (suffix === "markdown") {
            // For markdown arrays, we need to stringify
            if (!Array.isArray(data)) {
                // Even if it's a single markdown, convert it to an array for consistency
                data = [data];
            }
            dataToWrite = Buffer.from(JSON.stringify(data));
        }
        else if (data instanceof Buffer) {
            dataToWrite = data;
        }
        else {
            // For other text types (like rawHtml), data will be a string
            dataToWrite = Buffer.from(data);
        }
        const gzipData = gzipSync(dataToWrite);
        await writeFileAsync(fullPath, gzipData);
        this.logger.info(`Cached ${suffix} for ${url}`);
    }
    /**
     * Process PDF files (fallback if no Firecrawl).
     * Now uses Puppeteer to fetch the PDF file content.
     */
    async getAndProcessPdfFallback(url) {
        this.logger.info(`Fetching PDF (fallback mode): ${url}`);
        const cachedPdf = (await this.getCachedData(url, "pdf"));
        let pdfBuffer;
        if (cachedPdf) {
            pdfBuffer = cachedPdf;
            this.logger.info("Got cached PDF");
        }
        else {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            const sleepingForMs = 50 + Math.random() * 100;
            this.logger.info(`Fetching PDF ${url} in ${sleepingForMs} ms`);
            await new Promise((r) => setTimeout(r, sleepingForMs));
            let response;
            try {
                response = await page.goto(url, { waitUntil: "networkidle0" });
            }
            catch (error) {
                this.logger.error(`Error fetching ${url} PDF with puppeteer: ${error.stack || error}`);
            }
            if (response && response.ok()) {
                pdfBuffer = await response.buffer();
                if (pdfBuffer) {
                    await this.cacheData(url, "pdf", pdfBuffer);
                }
            }
            else {
                this.logger.error(`Failed to load PDF from ${url}, response not OK`);
            }
            await page.close();
            await browser.close();
        }
        return new Promise((resolve) => {
            if (!pdfBuffer) {
                this.logger.error("No PDF buffer available");
                return resolve("");
            }
            let finalText = "";
            new PdfReader({ debug: false }).parseBuffer(pdfBuffer, (err, item) => {
                if (err) {
                    this.logger.error(`Error parsing PDF ${url}`);
                    this.logger.error(err);
                    return resolve("");
                }
                else if (!item) {
                    finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
                    resolve(finalText);
                }
                else if (item.text) {
                    finalText += item.text + " ";
                }
            });
        });
    }
    /**
     * Process HTML using puppeteer (fallback if no Firecrawl).
     */
    async getAndProcessHtmlFallback(url) {
        const cachedData = await this.getCachedData(url, "markdown");
        if (cachedData) {
            this.logger.info("Got cached Markdown");
            return cachedData;
        }
        const browser = await puppeteer.launch({ headless: true });
        const browserPage = await browser.newPage();
        const sleepingForMs = 50 + Math.random() * 100;
        this.logger.info(`Fetching HTML page ${url} in ${sleepingForMs} ms`);
        await new Promise((r) => setTimeout(r, sleepingForMs));
        let htmlText;
        try {
            const response = await browserPage.goto(url, {
                waitUntil: "networkidle0",
            });
            if (response) {
                htmlText = await response.text();
            }
        }
        catch (error) {
            this.logger.error(`Error fetching ${url} with puppeteer: ${error.stack || error}`);
        }
        await browserPage.close();
        await browser.close();
        if (!htmlText) {
            this.logger.error(`No HTML text found for ${url}`);
            return [""];
        }
        const markdown = htmlToText(htmlText, {
            wordwrap: false,
            selectors: [
                { selector: "a", format: "skip" },
                { selector: "img", format: "skip" },
                { selector: "form", format: "skip" },
                { selector: "nav", format: "skip" },
            ],
        }).replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
        await this.cacheData(url, "markdown", [markdown]);
        return [markdown];
    }
    /**
     * Process page using Firecrawl API.
     * Fetches both rawHtml and markdown, caches them, and returns the requested format.
     * Works for both HTML and PDF URLs.
     */
    async getAndProcessWithFirecrawl(url, format, crawlIfDomainIs = undefined) {
        // Try cache first
        const cached = await this.getCachedData(url, format);
        if (cached) {
            this.logger.info(`Got cached ${format} for ${url}`);
            return cached;
        }
        const scrapeResponse = await this.firecrawlAgent.scrapeUrl(url, ["markdown", "rawHtml"], 3, format === "markdown" ? true : false, crawlIfDomainIs);
        if (!scrapeResponse.success) {
            this.logger.error(JSON.stringify(scrapeResponse, null, 2));
            throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
        }
        let markdownArray;
        if (scrapeResponse.markdownArray) {
            markdownArray = scrapeResponse.markdownArray;
            this.logger.debug(`Got markdownArray: ${markdownArray.length}`);
        }
        else {
            markdownArray = [scrapeResponse.markdown];
            this.logger.debug(`Got markdown single: ${markdownArray.length}`);
        }
        const rawHtml = scrapeResponse.rawHtml;
        // Firecrawl returns markdown and rawHtml properties directly on scrapeResponse
        if (markdownArray) {
            await this.cacheData(url, "markdown", markdownArray);
        }
        if (rawHtml) {
            await this.cacheData(url, "rawHtml", rawHtml);
        }
        const result = format === "markdown" ? markdownArray : rawHtml;
        return result || [""];
    }
    /**
     * Public method to get and process a single page.
     * If FIRECRAWL_API_KEY is set, uses Firecrawl (for both HTML and PDFs).
     * Otherwise, uses puppeteer for HTML and Puppeteer-based PDF fetching.
     *
     * @param url The URL to retrieve
     * @param format Which format to return. Only applies if Firecrawl is used. Puppeteer fallback always returns markdown.
     * @param crawlIfDomainIs If specified, only crawl if the current URL's domain matches this domain.
     */
    async getAndProcessPage(url, format = "markdown", crawlIfDomainIs = undefined) {
        this.logger.info(`Getting page: ${url}`);
        if (this.firecrawlAgent) {
            // Use Firecrawl for both HTML and PDF
            return await this.getAndProcessWithFirecrawl(url, format, crawlIfDomainIs);
        }
        else {
            // Use puppeteer/pdf fallback
            if (url.toLowerCase().endsWith(".pdf")) {
                return await this.getAndProcessPdfFallback(url);
            }
            else {
                return await this.getAndProcessHtmlFallback(url);
            }
        }
    }
}
//# sourceMappingURL=getWebPagesBase.js.map