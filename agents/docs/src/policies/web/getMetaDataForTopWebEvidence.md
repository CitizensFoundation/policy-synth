# GetMetaDataForTopWebEvidenceProcessor

This class extends `GetEvidenceWebPagesProcessor` to process web pages and extract metadata for top web evidence. It includes methods for processing HTML and PDF pages, refining web evidence based on policies, and handling sub-problems.

## Methods

| Name                        | Parameters                                                                                                                                                                                                 | Return Type | Description                                                                                   |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| processPageText             | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined         | Promise<void> | Processes the text of a web page to extract metadata and save it.                             |
| getAndProcessPdf            | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined                       | Promise<void> | Downloads, processes, and extracts metadata from a PDF document.                              |
| getAndProcessHtml           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined    | Promise<void> | Fetches, processes, and extracts metadata from an HTML page.                                  |
| getAndProcessEvidencePage   | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy                                                                                                     | Promise<boolean> | Determines the type of web page (PDF or HTML) and processes it accordingly.                   |
| refineWebEvidence           | policy: PSPolicy, subProblemIndex: number, page: Page                                                                                                                                                       | Promise<void> | Refines web evidence for a given policy by processing top web pages.                          |
| processSubProblems          | browser: Browser                                                                                                                                                                                            | Promise<void> | Processes sub-problems by refining web evidence for each sub-problem.                         |
| getAllPages                 |                                                                                                                                                                                                             | Promise<void> | Launches a browser, processes sub-problems to refine web evidence, and then closes the browser.|
| process                     |                                                                                                                                                                                                             | Promise<void> | Main method to start the web metadata extraction process.                                     |

## Example

```javascript
// Example usage of GetMetaDataForTopWebEvidenceProcessor
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GetMetaDataForTopWebEvidenceProcessor } from '@policysynth/agents/policies/web/getMetaDataForTopWebEvidence.js';

// Apply the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const processor = new GetMetaDataForTopWebEvidenceProcessor();
  await processor.process();

  await browser.close();
}

main().catch(console.error);
```