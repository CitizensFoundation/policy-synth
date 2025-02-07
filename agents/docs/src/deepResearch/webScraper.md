# WebScraper

The `WebScraper` class is a minimal Puppeteer-based scraper that supports both HTML and PDF scraping. It utilizes a shared/static Puppeteer browser instance to optimize performance and reduce overhead. The class can parse PDFs using the `pdfreader` library and scrape HTML content using Puppeteer.

## Properties

| Name              | Type    | Description                                                                 |
|-------------------|---------|-----------------------------------------------------------------------------|
| browserInstance   | Browser \| null | A static property that holds a shared Puppeteer `Browser` instance across the entire process. |

## Methods

| Name         | Parameters | Return Type | Description                                                                 |
|--------------|------------|-------------|-----------------------------------------------------------------------------|
| getBrowser   | -          | Promise<Browser> | Lazy-loads or reuses the static `Browser` instance.                         |
| scrapeUrl    | url: string | Promise<{ success: boolean; data: { rawHtml?: string; pdfText?: string }; error?: string; }> | Scrapes the provided URL, determining whether it's a PDF or HTML and processing accordingly. |
| scrapePdf    | url: string | Promise<{ success: boolean; data: { pdfText: string }; error?: string; }> | Scrapes a PDF from the provided URL and returns the extracted text.         |
| scrapeHtml   | url: string | Promise<{ success: boolean; data: { rawHtml: string }; error?: string; }> | Scrapes HTML content from the provided URL and returns the raw HTML.        |

## Example

```typescript
import { WebScraper } from '@policysynth/agents/deepResearch/webScraper.js';

async function exampleUsage() {
  const scraper = new WebScraper();
  const url = "https://example.com";

  const result = await scraper.scrapeUrl(url);

  if (result.success) {
    if (result.data.rawHtml) {
      console.log("HTML Content:", result.data.rawHtml);
    } else if (result.data.pdfText) {
      console.log("PDF Text:", result.data.pdfText);
    }
  } else {
    console.error("Error:", result.error);
  }
}

exampleUsage();
```

This example demonstrates how to use the `WebScraper` class to scrape content from a URL. The class automatically determines whether the URL points to a PDF or an HTML page and processes it accordingly. The result includes either the raw HTML or the extracted PDF text, along with any errors encountered during the scraping process.