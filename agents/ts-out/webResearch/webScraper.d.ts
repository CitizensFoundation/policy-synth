/**
 * Minimal Puppeteer-based scraper class that supports:
 *  - Shared/static Puppeteer browser instance.
 *  - PDF parsing (via pdfreader) if URL ends with .pdf.
 *  - HTML scraping if URL is not a PDF.
 */
export declare class WebScraper {
    /**
     * We store one static (shared) Browser instance across the entire process
     * so Puppeteer is only launched once.
     */
    private static browserInstance;
    /**
     * Lazy-load (or re-use) the static Browser instance.
     */
    private static getBrowser;
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
    scrapeUrl(url: string): Promise<{
        success: boolean;
        data: {
            rawHtml?: string;
            pdfText?: string;
        };
        error?: string;
    }>;
    /**
     * Minimal PDF scraping with pdfreader:
     * - We do a direct Axios GET for the URL as `arraybuffer`.
     * - Use pdfreader to parse text line-by-line.
     * - Return a combined text in `pdfText`.
     */
    private scrapePdf;
    /**
     * Minimal HTML scraping using Puppeteer:
     * - Reuse or launch a headless browser
     * - Optionally skip images (via request interception)
     * - Return the full raw HTML (page.content())
     *   plus any derived text if you want it.
     */
    private scrapeHtml;
}
//# sourceMappingURL=webScraper.d.ts.map