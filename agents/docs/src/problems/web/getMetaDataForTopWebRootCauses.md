# GetMetaDataForTopWebRootCausesProcessor

This class extends `GetRootCausesWebPagesProcessor` to process web pages and extract metadata for top web root causes. It includes methods for processing HTML and PDF pages, refining web root causes, and orchestrating the overall process of fetching and processing web pages.

## Methods

| Name                          | Parameters                                                                                                                                                                                                 | Return Type | Description                                                                                   |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a page to extract metadata and save it.                                 |
| getAndProcessPdf              | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined          | Promise<void> | Fetches a PDF from a URL, processes its text, and extracts metadata.                          |
| getAndProcessHtml             | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches an HTML page from a URL, processes its text, and extracts metadata.                   |
| getAndProcessRootCausePage    | url: string, browserPage: Page, type: PSRootCauseWebPageTypes                                                                                                                                               | Promise<boolean> | Determines the type of a web page (HTML or PDF) and processes it accordingly.                 |
| refineWebRootCauses           | page: Page                                                                                                                                                                                                  | Promise<void> | Refines web root causes by processing top pages for each root cause type.                     |
| processSubProblems            | browser: Browser                                                                                                                                                                                            | Promise<void> | Orchestrates the process of refining root causes by opening a new browser page.               |
| getAllPages                   |                                                                                                                                                                                                             | Promise<void> | Launches a browser, processes sub-problems, saves memory, and closes the browser.             |
| process                       |                                                                                                                                                                                                             | Promise<void> | Main method to start the process of getting web metadata for top web root causes.             |

## Example

```javascript
// Example usage of GetMetaDataForTopWebRootCausesProcessor
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GetMetaDataForTopWebRootCausesProcessor } from '@policysynth/agents/problems/web/getMetaDataForTopWebRootCauses.js';

// Apply the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const processor = new GetMetaDataForTopWebRootCausesProcessor();

  // Start the process
  await processor.process();

  await browser.close();
}

main().catch(console.error);
```