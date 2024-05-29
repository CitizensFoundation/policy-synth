# GetWebPagesProcessor

The `GetWebPagesProcessor` class is responsible for fetching, processing, and analyzing web pages and PDFs to extract relevant information and solutions to specified problems. It extends the `BaseProblemSolvingAgent` class and utilizes various libraries and tools such as Puppeteer, StealthPlugin, PdfReader, and more.

## Properties

| Name                | Type                | Description                                                                 |
|---------------------|---------------------|-----------------------------------------------------------------------------|
| webPageVectorStore  | WebPageVectorStore  | Instance of the WebPageVectorStore for storing web page data.               |
| totalPagesSave      | number              | Counter for the total number of pages saved.                                |
| chat                | ChatOpenAI          | Instance of ChatOpenAI for interacting with the OpenAI API.                 |

## Methods

| Name                      | Parameters                                                                 | Return Type                | Description                                                                                       |
|---------------------------|---------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------|
| renderScanningPrompt      | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number | (SystemMessage \| HumanMessage)[] | Renders the scanning prompt for the AI analysis.                                                  |
| getTokenCount             | text: string, subProblemIndex: number \| undefined                        | Promise<{ totalTokenCount: number, promptTokenCount: any }> | Calculates the token count for the given text.                                                    |
| getAllTextForTokenCheck   | text: string, subProblemIndex: number \| undefined                        | string                     | Combines the prompt messages and text for token checking.                                         |
| mergeAnalysisData         | data1: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData, data2: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | Merges two sets of analysis data.                                                                  |
| isWithinTokenLimit        | allText: string, maxChunkTokenCount: number                               | boolean                    | Checks if the given text is within the token limit.                                                |
| splitText                 | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined | string[]                   | Splits the text into chunks based on the token limit.                                              |
| getAIAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number              | Promise<IEngineWebPageAnalysisData> | Gets AI analysis for the given text.                                                               |
| getTextAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number              | Promise<IEngineWebPageAnalysisData> | Analyzes the text and returns the analysis data.                                                   |
| processPageText           | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page and saves the analysis data.                                      |
| generateFileName          | url: string                                                               | string                     | Generates a file name based on the URL using SHA-256 hash.                                         |
| getAndProcessPdf          | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>              | Fetches and processes a PDF file.                                                                  |
| getAndProcessHtml         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>              | Fetches and processes an HTML page.                                                                |
| getAndProcessPage         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>            | Fetches and processes a web page (either HTML or PDF).                                             |
| processSubProblems        | browser: Browser                                                          | Promise<void>              | Processes all sub-problems by fetching and analyzing web pages.                                    |
| processEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes, browserPage: Page | Promise<void>              | Processes entities within a sub-problem by fetching and analyzing web pages.                       |
| getUrlsToFetch            | allPages: IEngineSearchResultItem[]                                       | string[]                   | Extracts URLs to fetch from the search results.                                                    |
| processProblemStatement   | searchQueryType: IEngineWebPageTypes, browserPage: Page                   | Promise<void>              | Processes the problem statement by fetching and analyzing web pages.                               |
| getAllCustomSearchUrls    | browserPage: Page                                                         | Promise<void>              | Fetches and processes custom search URLs for all sub-problems.                                     |
| getAllPages               | none                                                                      | Promise<void>              | Fetches and processes all pages for the problem statement and sub-problems.                        |
| process                   | none                                                                      | Promise<void>              | Main method to start the processing of web pages and PDFs.                                         |

## Example

```typescript
import { GetWebPagesProcessor } from '@policysynth/agents/solutions/web/getWebPages.js';

const processor = new GetWebPagesProcessor();
await processor.process();
```