import puppeteer, { Browser, Page } from "puppeteer";
import axios from "axios";
import { extractTextFromPdfBuffer } from "../base/pdfText.js";

/**
 * Minimal Puppeteer-based scraper class that supports:
 *  - Shared/static Puppeteer browser instance.
 *  - PDF parsing if URL ends with .pdf.
 *  - HTML scraping if URL is not a PDF.
 */
export class WebScraper {
  /**
   * We store one static (shared) Browser instance across the entire process
   * so Puppeteer is only launched once.
   */
  private static browserInstance: Browser | null = null;

  /**
   * Lazy-load (or re-use) the static Browser instance.
   */
  private static async getBrowser(): Promise<Browser> {
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
   *  1. If it's a PDF (ends with ".pdf"), we fetch + parse text.
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
  public async scrapeUrl(url: string): Promise<{
    success: boolean;
    data: { rawHtml?: string; pdfText?: string };
    error?: string;
  }> {
    // Decide by file extension; for more robust detection, check Content-Type header too
    const isPdf = url.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      return this.scrapePdf(url);
    } else {
      return this.scrapeHtml(url);
    }
  }

  /**
   * Minimal PDF scraping:
   * - We do a direct Axios GET for the URL as `arraybuffer`.
   * - Use the shared PDF parser helper to extract text.
   * - Return a combined text in `pdfText`.
   */
  private async scrapePdf(url: string): Promise<{
    success: boolean;
    data: { pdfText: string };
    error?: string;
  }> {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const pdfBuffer = response.data as Buffer;

      if (!pdfBuffer || pdfBuffer.length === 0) {
        return {
          success: false,
          data: { pdfText: "" },
          error: "Empty PDF buffer",
        };
      }

      const pdfText = await extractTextFromPdfBuffer(pdfBuffer);

      return {
        success: true,
        data: { pdfText },
      };
    } catch (error: any) {
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
  private async scrapeHtml(url: string): Promise<{
    success: boolean;
    data: { rawHtml: string };
    error?: string;
  }> {
    let page: Page | null = null;

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
    } catch (error: any) {
      return {
        success: false,
        data: { rawHtml: "" },
        error: `Failed to scrape HTML: ${error.message}`,
      };
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }
}
