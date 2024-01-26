# GetMetaDataForTopWebEvidenceProcessor

This class extends `GetEvidenceWebPagesProcessor` to process web pages and PDFs to extract metadata and refine web evidence for policies. It utilizes Puppeteer for web scraping, Metascraper for metadata extraction, and custom logic for handling PDFs and HTML content.

## Methods

| Name                        | Parameters                                                                                                                                                                                                 | Return Type | Description                                                                                   |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| processPageText             | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined         | void        | Processes the text of a web page to extract metadata and save it.                            |
| getAndProcessPdf            | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined                       | Promise<void> | Processes a PDF document by extracting its text and then processing it like a web page text. |
| getAndProcessHtml           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined = undefined      | void        | Fetches and processes the HTML content of a web page.                                        |
| getAndProcessEvidencePage   | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy                                                                                                     | Promise<boolean> | Determines the type of web page (PDF or HTML) and processes it accordingly.                  |
| refineWebEvidence           | policy: PSPolicy, subProblemIndex: number, page: Page                                                                                                                                                       | void        | Refines web evidence for a given policy by processing top web pages.                         |
| processSubProblems          | browser: Browser                                                                                                                                                                                            | void        | Processes sub-problems to refine web evidence for policies.                                  |
| getAllPages                 |                                                                                                                                                                                                             | void        | Initializes a Puppeteer browser and processes all sub-problems.                             |
| process                     |                                                                                                                                                                                                             | void        | Main method to start the web metadata extraction and evidence refinement process.           |

## Example

```typescript
// Example usage of GetMetaDataForTopWebEvidenceProcessor
import { GetMetaDataForTopWebEvidenceProcessor } from '@policysynth/agents/policies/web/getMetaDataForTopWebEvidence.ts';
import puppeteer from 'puppeteer-extra';

(async () => {
  const processor = new GetMetaDataForTopWebEvidenceProcessor();
  const browser = await puppeteer.launch({ headless: true });
  await processor.process();
  await browser.close();
})();
```