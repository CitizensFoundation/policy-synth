# BaseGetWebPagesAgent

The `BaseGetWebPagesAgent` class is an extension of the `PolicySynthSimpleAgentBase` class. It is designed to fetch, process, and analyze web pages and PDFs to extract relevant information and solutions related to a given problem statement. The class utilizes Puppeteer for web scraping and PDFReader for processing PDF files.

## Properties

| Name                | Type   | Description                                                                 |
|---------------------|--------|-----------------------------------------------------------------------------|
| urlsScanned         | Set<string> | A set to keep track of URLs that have already been scanned.              |
| totalPagesSave      | number | Counter for the total number of pages saved.                                |
| maxModelTokensOut   | number | Maximum number of tokens for the model output. Default is 4096.             |
| modelTemperature    | number | Temperature setting for the model. Default is 0.0.                          |

## Methods

| Name                      | Parameters                                                                 | Return Type | Description                                                                                     |
|---------------------------|----------------------------------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------|
| renderScanningPrompt      | problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number | string[]    | Renders a prompt for scanning text in relation to a problem statement.                          |
| getTokenCount             | text: string, subProblemIndex: number \| undefined                         | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Calculates the token count for a given text.                                                    |
| getAllTextForTokenCheck   | text: string, subProblemIndex: number \| undefined                         | string      | Combines prompt messages and text for token checking.                                           |
| isWithinTokenLimit        | allText: string, maxChunkTokenCount: number                                | boolean     | Checks if the text is within the token limit.                                                   |
| splitText                 | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined | string[]    | Splits text into chunks based on token limits.                                                  |
| getAIAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number               | Promise<any> | Gets AI analysis for a given text.                                                              |
| getTextAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number               | Promise<any[]> | Analyzes text and returns the analysis results.                                                 |
| processPageText           | text: string, subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void \| any[]> | Processes the text of a page and saves the analysis.                                            |
| generateFileName          | url: string                                                                | string      | Generates a file name based on the URL using SHA-256 hashing.                                   |
| getAndProcessPdf          | subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void> | Fetches and processes a PDF file.                                                               |
| getAndProcessHtml         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined | Promise<void> | Fetches and processes an HTML page.                                                             |
| getAndProcessPage         | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined | Promise<boolean> | Determines whether to process a page as a PDF or HTML and processes it accordingly.             |
| getUrlsToFetch            | allPages: PsSearchResultItem[]                                             | string[]    | Determines which URLs to fetch based on a percentage of the total pages.                        |
| getAllPages               |                                                                            | Promise<void> | Launches a browser and processes all pages for different search query types.                    |
| process                   |                                                                            | Promise<void> | Main process method to initiate the fetching and processing of web pages.                       |

## Example

```typescript
import { BaseGetWebPagesAgent } from '@policysynth/agents/webResearch/getWebPages.js';

const agent = new BaseGetWebPagesAgent();
agent.process();
```

This class is designed to be used in scenarios where web pages and PDFs need to be analyzed for solutions related to specific problem statements. It leverages AI models to extract and analyze relevant information from the text content of web pages and PDFs.