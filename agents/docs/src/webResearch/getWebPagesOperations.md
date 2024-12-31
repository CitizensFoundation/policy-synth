# BaseGetWebPagesOperationsAgent

The `BaseGetWebPagesOperationsAgent` is a class that extends the `PolicySynthAgent` and is designed to perform web page operations, including fetching, processing, and analyzing web pages and PDFs. It utilizes Puppeteer for web scraping and PDFReader for PDF processing. The agent is capable of analyzing text to identify solutions to specified problems.

## Properties

| Name              | Type   | Description                                                                 |
|-------------------|--------|-----------------------------------------------------------------------------|
| urlsScanned       | Set<string> | A set to keep track of URLs that have already been scanned.              |
| totalPagesSave    | number | A counter to track the total number of pages saved.                         |

## Methods

| Name                        | Parameters                                                                 | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderScanningPrompt        | problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number | string[]    | Renders a prompt for scanning text related to a problem statement.          |
| getTokenCount               | text: string, subProblemIndex: number \| undefined                         | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Calculates the token count for a given text.                                |
| getAllTextForTokenCheck     | text: string, subProblemIndex: number \| undefined                         | string      | Combines prompt messages and text for token checking.                       |
| isWithinTokenLimit          | allText: string, maxChunkTokenCount: number                                | boolean     | Checks if the text is within the token limit.                               |
| splitText                   | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined | string[]    | Splits text into chunks based on token limits.                              |
| getAIAnalysis               | text: string, subProblemIndex?: number, entityIndex?: number               | Promise<any> | Gets AI analysis for the given text.                                        |
| getTextAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number               | Promise<any[]> | Analyzes text and returns the analysis results.                             |
| processPageText             | text: string, subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void \| any[]> | Processes the text of a page and performs analysis.                         |
| generateFileName            | url: string                                                                | string      | Generates a file name based on the URL using SHA-256 hash.                  |
| getAndProcessPdf            | subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void> | Fetches and processes a PDF document.                                       |
| getAndProcessHtml           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void> | Fetches and processes an HTML page.                                         |
| getAndProcessPage           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined | Promise<boolean> | Determines whether to process a page as a PDF or HTML and processes it.     |
| getUrlsToFetch              | allPages: PsSearchResultItem[]                                             | string[]    | Retrieves a list of URLs to fetch based on search results.                  |
| getAllPages                 | none                                                                       | Promise<void> | Launches a browser and processes all pages for different search query types.|
| process                     | none                                                                       | Promise<void> | Main process method to execute the web page operations.                     |

## Example

```typescript
import { BaseGetWebPagesOperationsAgent } from '@policysynth/agents/webResearch/getWebPagesOperations.js';

const agent = new BaseGetWebPagesOperationsAgent();
agent.process();
```

This class is designed to be used in scenarios where web pages and PDFs need to be fetched, processed, and analyzed for solutions to specific problems. It leverages AI models to analyze text and identify potential solutions, making it a powerful tool for research and analysis tasks.