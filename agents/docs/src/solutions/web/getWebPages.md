# GetWebPagesProcessor

This class is responsible for processing web pages to extract and analyze text for problem-solving purposes. It extends the `BaseProblemSolvingAgent` class and utilizes various methods to fetch, process, and analyze web pages, including PDFs and HTML content.

## Properties

| Name                | Type                        | Description                                   |
|---------------------|-----------------------------|-----------------------------------------------|
| webPageVectorStore  | WebPageVectorStore          | Store for web page vectors.                   |
| totalPagesSave      | number                      | Counter for the total number of saved pages.  |

## Methods

| Name                        | Parameters                                                                                      | Return Type                        | Description                                                                 |
|-----------------------------|-------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| renderScanningPrompt        | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number | SystemMessage[] \| HumanMessage[]  | Renders the scanning prompt for AI analysis.                                 |
| getTokenCount               | text: string, subProblemIndex: number \| undefined                                              | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Calculates the token count for a given text.                                 |
| getAllTextForTokenCheck     | text: string, subProblemIndex: number \| undefined                                              | string                             | Gets all text for token checking.                                            |
| mergeAnalysisData           | data1: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData, data2: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | Merges two sets of analysis data.                                            |
| isWithinTokenLimit          | allText: string, maxChunkTokenCount: number                                                     | boolean                            | Checks if the text is within the token limit.                                |
| splitText                   | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined              | string[]                           | Splits text into manageable chunks based on token limits.                    |
| getAIAnalysis               | text: string, subProblemIndex?: number, entityIndex?: number                                    | Promise<IEngineWebPageAnalysisData> | Gets AI analysis for the given text.                                         |
| getTextAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number                                    | Promise<IEngineWebPageAnalysisData> | Analyzes the text using AI.                                                  |
| processPageText             | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page.                                            |
| generateFileName            | url: string                                                                                     | string                             | Generates a file name based on the URL hash.                                 |
| getAndProcessPdf            | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>                      | Fetches and processes a PDF from a URL.                                      |
| getAndProcessHtml           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>                      | Fetches and processes HTML content from a URL.                               |
| getAndProcessPage           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                   | Fetches and processes a web page.                                            |
| processSubProblems          | browser: Browser                                                                                | Promise<void>                      | Processes sub-problems by fetching and analyzing web pages.                  |
| processEntities             | subProblemIndex: number, searchQueryType: IEngineWebPageTypes, browserPage: Page                | Promise<void>                      | Processes entities by fetching and analyzing web pages.                      |
| getUrlsToFetch              | allPages: IEngineSearchResultItem[]                                                              | string[]                           | Extracts URLs to fetch from search result items.                             |
| processProblemStatement     | searchQueryType: IEngineWebPageTypes, browserPage: Page                                          | Promise<void>                      | Processes the problem statement by fetching and analyzing web pages.         |
| getAllCustomSearchUrls      | browserPage: Page                                                                                | Promise<void>                      | Processes custom search URLs.                                                |
| getAllPages                 | -                                                                                               | Promise<void>                      | Fetches and processes all relevant web pages.                                |
| process                     | -                                                                                               | Promise<void>                      | Main processing function to initiate the fetching and analysis of web pages. |

## Example

```typescript
import { GetWebPagesProcessor } from '@policysynth/agents/solutions/web/getWebPages.js';

const processor = new GetWebPagesProcessor();
processor.process().then(() => {
  console.log('Processing complete.');
});
```