import puppeteer from "puppeteer";
import { PdfReader } from "pdfreader";
import axios from "axios";
/**
 * Minimal Puppeteer-based scraper class that supports:
 *  - Shared/static Puppeteer browser instance.
 *  - PDF parsing (via pdfreader) if URL ends with .pdf.
 *  - HTML scraping if URL is not a PDF.
 */
export class WebScraper {
    /**
     * We store one static (shared) Browser instance across the entire process
     * so Puppeteer is only launched once.
     */
    static browserInstance = null;
    /**
     * Lazy-load (or re-use) the static Browser instance.
     */
    static async getBrowser() {
        if (!WebScraper.browserInstance) {
            WebScraper.browserInstance = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
        }
        return WebScraper.browserInstance;
    }
    /**
     * This method scrapes the provided URL:
     *  1. If it's a PDF (ends with ".pdf"), we fetch + parse text with pdfreader.
     *  2. Otherwise, we load the URL in Puppeteer, returning the text + HTML.
     *
     *  skipImages: If true, will intercept & block image requests for speed.
     *
     *  Return shape:
     *  {
     *    success: boolean;
     *    data: {
     *      rawHtml?: string;
     *      pdfText?: string;
     *    }[];
     *    error?: string;
     *  }
     */
    async scrapeUrl(url) {
        // Decide by file extension; for more robust detection, check Content-Type header too
        const isPdf = url.toLowerCase().endsWith(".pdf");
        if (isPdf) {
            return this.scrapePdf(url);
        }
        else {
            return this.scrapeHtml(url);
        }
    }
    /**
     * Minimal PDF scraping with pdfreader:
     * - We do a direct Axios GET for the URL as `arraybuffer`.
     * - Use pdfreader to parse text line-by-line.
     * - Return a combined text in `pdfText`.
     */
    async scrapePdf(url) {
        try {
            const response = await axios.get(url, { responseType: "arraybuffer" });
            const pdfBuffer = response.data;
            if (!pdfBuffer || pdfBuffer.length === 0) {
                return {
                    success: false,
                    data: { pdfText: "" },
                    error: "Empty PDF buffer",
                };
            }
            // We'll parse PDF text asynchronously with pdfreader
            const pdfText = await new Promise((resolve, reject) => {
                let finalText = "";
                try {
                    new PdfReader({}).parseBuffer(pdfBuffer, (err, item) => {
                        if (err) {
                            return reject(err);
                        }
                        // 'item === null' means we've reached end of the PDF
                        if (!item) {
                            return resolve(finalText.trim());
                        }
                        if (item.text) {
                            // Accumulate text content
                            finalText += item.text + " ";
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
            return {
                success: true,
                data: { pdfText },
            };
        }
        catch (error) {
            return {
                success: false,
                data: { pdfText: "" },
                error: `Failed to scrape PDF: ${error.message}`,
            };
        }
    }
    /**
     * Minimal HTML scraping using Puppeteer:
     * - Reuse or launch a headless browser
     * - Optionally skip images (via request interception)
     * - Return the full raw HTML (page.content())
     *   plus any derived text if you want it.
     */
    async scrapeHtml(url) {
        let page = null;
        try {
            const browser = await WebScraper.getBrowser();
            page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });
            // Here we simply get raw HTML. If you also want
            // plain text, do e.g.: const text = await page.evaluate(() => document.body.innerText);
            const rawHtml = await page.content();
            return {
                success: true,
                data: { rawHtml },
            };
        }
        catch (error) {
            return {
                success: false,
                data: { rawHtml: "" },
                error: `Failed to scrape HTML: ${error.message}`,
            };
        }
        finally {
            if (page) {
                await page.close().catch(() => { });
            }
        }
    }
}
//# sourceMappingURL=webScraper.js.map