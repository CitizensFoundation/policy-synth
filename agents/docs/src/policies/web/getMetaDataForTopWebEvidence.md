# GetMetaDataForTopWebEvidenceProcessor

This class is responsible for processing web pages to extract metadata and handle PDF and HTML content for evidence gathering in policy synthesis.

## Methods

| Name                          | Parameters                                                                                                      | Return Type | Description                                                                                     |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------|
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a web page to extract metadata and save it.                               |
| getAndProcessPdf              | subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Handles the processing of a PDF file from a URL, extracting text and processing it for metadata. |
| getAndProcessHtml             | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: PsWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches and processes HTML content from a URL, extracting and processing text for metadata.      |
| getAndProcessEvidencePage     | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy          | Promise<boolean> | Determines the content type of a URL and processes it accordingly as HTML or PDF.               |
| refineWebEvidence             | policy: PSPolicy, subProblemIndex: number, page: Page                                                            | Promise<void> | Processes and refines web evidence for a given policy and sub-problem index.                    |
| processSubProblems            | browser: Browser                                                                                                | Promise<void> | Processes sub-problems to refine web evidence using multiple browser pages.                     |
| getAllPages                   | -                                                                                                               | Promise<void> | Manages the browser lifecycle and processes all sub-problems for web evidence gathering.        |
| process                       | -                                                                                                               | Promise<void> | Initiates the process of gathering and refining web metadata for evidence.                      |

## Example

```typescript
import { GetMetaDataForTopWebEvidenceProcessor } from '@policysynth/agents/policies/web/getMetaDataForTopWebEvidence.js';
import puppeteer from "puppeteer";

async function runProcessor() {
  const browser = await puppeteer.launch({ headless: true });
  const processor = new GetMetaDataForTopWebEvidenceProcessor();

  await processor.process();
  await browser.close();
}

runProcessor();
```