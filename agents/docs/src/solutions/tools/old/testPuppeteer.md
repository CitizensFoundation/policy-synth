# Puppeteer Utility Functions

This document outlines utility functions for processing PDF and HTML content using Puppeteer, Redis for caching, and additional tools for text extraction and PDF reading.

## Methods

| Name              | Parameters                                                                                   | Return Type | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| getAndProcessPdf  | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | Promise<void> | Processes a PDF from a given URL, caches it in Redis, and extracts text from it.              |
| getAndProcessHtml | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | Promise<void> | Retrieves HTML content from a given URL, caches it in Redis, and converts it to plain text.   |

## Example

```javascript
// Example usage of Puppeteer utility functions
import puppeteer, { Page } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import ioredis from "ioredis";

// Initialize Puppeteer with StealthPlugin
puppeteer.use(StealthPlugin());

// Example URL to process
let url = "https://example.com/sample.pdf";

// Launch Puppeteer browser instance
puppeteer.launch({ headless: true }).then(async (browser) => {
  const page = await browser.newPage();

  // Adjust URL if necessary (specific to this example logic)
  if (url.includes("/pdf/") && url.includes("arxiv") && !url.endsWith(".pdf")) {
    url = `${url}.pdf`;
  }

  console.log(url);

  // Determine whether to process a PDF or HTML content based on URL
  if (url.endsWith(".pdf")) {
    await getAndProcessPdf(1, url, page, "general");
  } else {
    await getAndProcessHtml(1, url, page, "general");
  }

  // Close the browser instance after processing
  await browser.close();

  // Exit the process
  process.exit(0);
});
```

This example demonstrates how to use the `getAndProcessPdf` and `getAndProcessHtml` functions to process content from a given URL using Puppeteer. It includes logic to adjust the URL for specific cases, determine the content type (PDF or HTML), and process the content accordingly. The example also shows how to initialize Puppeteer with the `StealthPlugin` to avoid detection and use Redis for caching.