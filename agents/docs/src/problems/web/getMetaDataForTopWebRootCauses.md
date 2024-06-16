# GetMetaDataForTopWebRootCausesProcessor

This class processes web pages to extract metadata for top web root causes. It extends the `GetRootCausesWebPagesProcessor` class and includes methods to handle PDF and HTML content, caching mechanisms, and metadata extraction using the `metascraper` library.

## Properties

No properties are explicitly defined in this class that are not inherited.

## Methods

| Name                          | Parameters                                                                                                                                                                                                 | Return Type | Description                                                                                   |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a web page to extract metadata and save it.                             |
| getAndProcessPdf              | subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined           | Promise<void> | Handles the processing of a PDF file by extracting text and processing it for metadata.       |
| getAndProcessHtml             | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes an HTML page to extract text and subsequently extract metadata.                     |
| getAndProcessRootCausePage    | url: string, browserPage: Page, type: PSRootCauseWebPageTypes                                                                                                                                               | Promise<boolean> | Determines the type of web page (PDF or HTML) and processes it accordingly.                   |
| refineWebRootCauses           | page: Page                                                                                                                                                                                                  | Promise<void> | Processes multiple web pages to refine root causes by extracting and analyzing their metadata. |
| processSubProblems            | browser: Browser                                                                                                                                                                                            | Promise<void> | Manages the process of refining root causes for all subproblems in a session.                  |
| getAllPages                   | -                                                                                                                                                                                                           | Promise<void> | Initializes a browser session and processes all subproblems.                                  |
| process                       | -                                                                                                                                                                                                           | Promise<void> | Main method to start the metadata extraction process for web pages.                           |

## Example

```typescript
import { GetMetaDataForTopWebRootCausesProcessor } from '@policysynth/agents/problems/web/getMetaDataForTopWebRootCauses.js';
import puppeteer from "puppeteer";

async function runMetaDataExtraction() {
  const browser = await puppeteer.launch({ headless: true });
  const metaDataProcessor = new GetMetaDataForTopWebRootCausesProcessor();

  await metaDataProcessor.process();
  await browser.close();
}

runMetaDataExtraction();
```