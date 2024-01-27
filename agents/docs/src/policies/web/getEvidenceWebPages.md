# GetEvidenceWebPagesProcessor

This class extends `GetWebPagesProcessor` to specifically handle the retrieval and processing of web pages for evidence collection related to policy analysis. It interacts with various components such as `EvidenceWebPageVectorStore` for storing evidence data, `ChatOpenAI` for generating prompts and analyzing text, and puppeteer for web scraping.

## Properties

| Name                        | Type                                              | Description |
|-----------------------------|---------------------------------------------------|-------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore                        | Instance of `EvidenceWebPageVectorStore` for storing evidence data. |
| chat                        | ChatOpenAI                                        | Instance of `ChatOpenAI` used for generating prompts and analyzing text. |
| totalPagesSave              | number                                            | Tracks the total number of pages saved during the process. |

## Methods

| Name                          | Parameters                                                                                                      | Return Type                                      | Description |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-------------|
| renderEvidenceScanningPrompt  | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string                           | SystemMessage[]                                  | Generates a prompt for evidence scanning based on the given parameters. |
| getEvidenceTokenCount         | text: string, subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes                           | Promise<{ totalTokenCount: number, promptTokenCount: { totalCount: number } }> | Calculates the token count for the given text and prompt. |
| getEvidenceTextAnalysis       | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string                           | Promise<PSEvidenceRawWebPageData \| PSRefinedPolicyEvidence> | Analyzes the given text for evidence related to the specified policy and type. |
| getEvidenceAIAnalysis         | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string                           | Promise<PSEvidenceRawWebPageData>                | Uses AI to analyze the given text for evidence. |
| mergeAnalysisData             | data1: PSEvidenceRawWebPageData, data2: PSEvidenceRawWebPageData                                                | PSEvidenceRawWebPageData                         | Merges two sets of analysis data into one. |
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>                                    | Processes the given page text for evidence analysis. |
| getAndProcessEvidencePage     | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy         | Promise<boolean>                                 | Retrieves and processes a single evidence page. |
| processSubProblems            | browser: Browser                                                                                                 | Promise<void>                                    | Processes sub-problems by retrieving and analyzing evidence pages. |
| getAllPages                   | -                                                                                                                | Promise<void>                                    | Retrieves and processes all evidence pages. |
| process                       | -                                                                                                                | Promise<void>                                    | Main method to start the evidence page retrieval and processing. |

## Example

```javascript
// Example usage of GetEvidenceWebPagesProcessor
import { GetEvidenceWebPagesProcessor } from '@policysynth/agents/policies/web/getEvidenceWebPages.js';
import puppeteer from 'puppeteer-extra';

(async () => {
  const processor = new GetEvidenceWebPagesProcessor();
  const browser = await puppeteer.launch({ headless: true });
  await processor.process();
  await browser.close();
})();
```