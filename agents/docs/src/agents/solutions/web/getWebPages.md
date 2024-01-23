# GetWebPagesProcessor

The `GetWebPagesProcessor` class is responsible for processing web pages related to a problem statement and its sub-problems. It fetches, analyzes, and stores relevant information from web pages, including PDFs and HTML content, to aid in finding practical solutions to complex issues.

## Properties

| Name                  | Type                          | Description                                           |
|-----------------------|-------------------------------|-------------------------------------------------------|
| webPageVectorStore    | WebPageVectorStore            | An instance of WebPageVectorStore to handle storage.  |
| totalPagesSave        | number                        | The total number of pages saved during processing.    |

## Methods

| Name                      | Parameters                                      | Return Type | Description                                                                 |
|---------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderScanningPrompt      | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number | SystemMessage[] | Renders the scanning prompt for the AI to analyze the text.                  |
| getTokenCount             | text: string, subProblemIndex: number \| undefined | Promise<{ totalTokenCount: number; promptTokenCount: any; }> | Gets the token count for the given text and sub-problem index.               |
| getAllTextForTokenCheck   | text: string, subProblemIndex: number \| undefined | string      | Gets all text for token check including prompt messages and the given text.  |
| mergeAnalysisData         | data1: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData, data2: IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | IEngineWebPageAnalysisData \| PSEvidenceRawWebPageData \| PSRootCauseRawWebPageData | Merges two sets of analysis data into one.                                   |
| isWithinTokenLimit        | allText: string, maxChunkTokenCount: number | boolean     | Checks if the estimated token count is within the specified token limit.    |
| splitText                 | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined | string[]    | Splits the text into chunks that are within the token limit.                 |
| getAIAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number | Promise<IEngineWebPageAnalysisData> | Gets AI analysis for the given text, sub-problem index, and entity index.    |
| getTextAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number | Promise<IEngineWebPageAnalysisData> | Gets text analysis for the given text, sub-problem index, and entity index.  |
| processPageText           | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page and saves the analysis.                     |
| getAndProcessPdf          | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches and processes a PDF from a given URL.                                |
| getAndProcessHtml         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches and processes HTML content from a given URL.                         |
| getAndProcessPage         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean> | Fetches and processes a web page from a given URL.                           |
| processSubProblems        | browser: Browser                                | Promise<void> | Processes sub-problems by fetching and analyzing their related web pages.    |
| processEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes, browserPage: Page | Promise<void> | Processes entities related to a sub-problem by fetching and analyzing their related web pages. |
| getUrlsToFetch            | allPages: IEngineSearchResultItem[]             | string[]    | Retrieves URLs to fetch from search result items.                            |
| processProblemStatement   | searchQueryType: IEngineWebPageTypes, browserPage: Page | Promise<void> | Processes the problem statement by fetching and analyzing related web pages. |
| getAllCustomSearchUrls    | browserPage: Page                               | Promise<void> | Fetches and processes custom search URLs.                                    |
| getAllPages               | None                                            | Promise<void> | Fetches and processes all pages related to the problem statement and sub-problems. |
| process                   | None                                            | Promise<void> | Main processing method that orchestrates the fetching and analysis of web pages. |

## Examples

```typescript
// Example usage of the GetWebPagesProcessor class
const processor = new GetWebPagesProcessor();
await processor.process();
```

Note: The actual implementation of the methods and their usage may involve more complex logic and interactions with other components, which are not shown in this simplified example.