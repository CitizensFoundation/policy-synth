# GetWebPagesProcessor

This class is responsible for processing web pages, extracting text from HTML and PDFs, analyzing the text for relevant information, and saving the analysis. It extends the `BaseProblemSolvingAgent` class.

## Properties

| Name                | Type                          | Description                                   |
|---------------------|-------------------------------|-----------------------------------------------|
| webPageVectorStore  | WebPageVectorStore            | Instance of WebPageVectorStore.               |
| totalPagesSave      | number                        | Total number of pages saved.                  |

## Methods

| Name                      | Parameters                                                                                                      | Return Type                        | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| renderScanningPrompt      | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number         | SystemMessage[] \| HumanMessage[] | Renders the scanning prompt for AI analysis.                                 |
| getTokenCount             | text: string, subProblemIndex: number \| undefined                                                              | Promise<{ totalTokenCount: number; promptTokenCount: any; }> | Calculates the token count for a given text.                                |
| getAllTextForTokenCheck   | text: string, subProblemIndex: number \| undefined                                                              | string                             | Gets all text for token check.                                               |
| mergeAnalysisData         | data1: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData, data2: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | Merges two sets of analysis data.                                            |
| isWithinTokenLimit        | allText: string, maxChunkTokenCount: number                                                                     | boolean                            | Checks if the text is within the token limit.                                |
| splitText                 | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined                             | string[]                           | Splits the text into manageable chunks for analysis.                         |
| getAIAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number                                                    | Promise<IEngineWebPageAnalysisData> | Gets AI analysis for the given text.                                         |
| getTextAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number                                                    | Promise<IEngineWebPageAnalysisData> | Performs text analysis on the given text.                                    |
| processPageText           | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page.                                            |
| getAndProcessPdf          | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>                      | Fetches and processes a PDF document from a given URL.                       |
| getAndProcessHtml         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>                      | Fetches and processes an HTML page from a given URL.                         |
| getAndProcessPage         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                   | Determines the type of page (PDF or HTML) and processes it accordingly.      |
| processSubProblems        | browser: Browser                                                                                                 | Promise<void>                      | Processes sub-problems by fetching and analyzing web pages.                  |
| processEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes, browserPage: Page                                | Promise<void>                      | Processes entities by fetching and analyzing web pages.                      |
| getUrlsToFetch            | allPages: IEngineSearchResultItem[]                                                                              | string[]                           | Extracts URLs to fetch from search result items.                             |
| processProblemStatement   | searchQueryType: IEngineWebPageTypes, browserPage: Page                                                          | Promise<void>                      | Processes the problem statement by fetching and analyzing web pages.        |
| getAllCustomSearchUrls    | browserPage: Page                                                                                                | Promise<void>                      | Fetches and processes custom search URLs.                                    |
| getAllPages               | -                                                                                                                | Promise<void>                      | Orchestrates the fetching and processing of all relevant web pages.          |
| process                   | -                                                                                                                | Promise<void>                      | Main method to start the web pages processing.                               |

## Example

```javascript
// Example usage of GetWebPagesProcessor
import { GetWebPagesProcessor } from '@policysynth/agents/solutions/web/getWebPages.js';

const processor = new GetWebPagesProcessor();
await processor.process();
```