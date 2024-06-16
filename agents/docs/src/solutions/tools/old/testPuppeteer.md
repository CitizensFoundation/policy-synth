# Puppeteer Processing Module

This module provides functionality to process and extract text from both PDF and HTML web pages using Puppeteer, Redis for caching, and additional tools for PDF reading and HTML to text conversion.

## Properties

No properties are directly exposed by this module.

## Methods

| Name              | Parameters                                              | Return Type | Description                                                                 |
|-------------------|---------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| getAndProcessPdf  | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: PsWebPageTypes | Promise<void> | Processes a PDF from a URL, caches it, and extracts text.                   |
| getAndProcessHtml | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: PsWebPageTypes | Promise<void> | Fetches an HTML page, caches it, and converts it to plain text.             |

## Example

```typescript
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page } from "puppeteer";
import { getAndProcessPdf, getAndProcessHtml } from '@policysynth/agents/solutions/tools/old/testPuppeteer.js';

puppeteer.use(StealthPlugin());

async function processWebContent() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const url = "https://example.com/document.pdf";

  if (url.endsWith(".pdf")) {
    await getAndProcessPdf(undefined, url, page, "general");
  } else {
    await getAndProcessHtml(undefined, url, page, "general");
  }

  await browser.close();
}

processWebContent();
```