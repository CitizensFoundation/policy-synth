# BaseGetWebPagesOperationsAgent

The `BaseGetWebPagesOperationsAgent` is a specialized agent class for automated web research and extraction of solution-oriented information from web pages and PDF documents. It leverages Puppeteer (with stealth plugin) for browser automation, PDF parsing, caching, and AI-powered text analysis to identify solutions relevant to a given problem statement.

This agent is designed to:
- Fetch and cache web pages (HTML and PDF).
- Extract and clean text from these sources.
- Chunk and analyze text using an AI model.
- Output structured solution data in a standardized JSON format.
- Avoid redundant processing via caching and URL tracking.

**File:** `@policysynth/agents/deepResearch/getWebPagesOperations.js`

---

## Properties

| Name             | Type                | Description                                                                 |
|------------------|---------------------|-----------------------------------------------------------------------------|
| urlsScanned      | Set<string>         | Tracks URLs that have already been processed to avoid duplicate work.       |
| totalPagesSave   | number              | Counter for the total number of pages saved/processed in the current run.   |

---

## Methods

| Name                        | Parameters                                                                                                                                                                                                                                    | Return Type         | Description                                                                                                                                                                                                                                    |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| renderScanningPrompt        | problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number                                                                                                                 | PsModelMessage[]    | Generates the system and human prompt messages for the AI model to analyze a text in the context of a problem statement.                                                                                |
| getTokenCount               | text: string, subProblemIndex: number \| undefined                                                                                                                                                      | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Estimates the total token count for a given text and prompt, used for chunking and model input size management.                                                                                         |
| getAllTextForTokenCheck     | text: string, subProblemIndex: number \| undefined                                                                                                                                                      | string              | Concatenates prompt and text for token estimation.                                                                                                                                                       |
| isWithinTokenLimit          | allText: string, maxChunkTokenCount: number                                                                                                                                                             | boolean             | Checks if the given text is within the allowed token limit.                                                                                                                                              |
| splitText                   | fullText: string, maxChunkTokenCount: number, subProblemIndex: number \| undefined                                                                                                                     | string[]            | Splits large texts into smaller chunks that fit within the model's token limit.                                                                                                                          |
| getAIAnalysis               | text: string, subProblemIndex?: number, entityIndex?: number                                                                                                                                            | Promise<any>        | Calls the AI model to analyze a chunk of text and extract solution data.                                                                                                                                 |
| getTextAnalysis             | text: string, subProblemIndex?: number, entityIndex?: number                                                                                                                                            | Promise<any[]>      | Handles chunking and aggregation of AI analysis results for large texts.                                                                                                                                 |
| processPageText             | text: string, subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy?: any                                                                             | Promise<void \| any[]> | Processes the extracted text from a page, analyzes it, and saves the results.                                                                                                                            |
| generateFileName            | url: string                                                                                                                                                                                            | string              | Generates a SHA-256 hash-based filename for caching, to avoid issues with long URLs.                                                                              |
| getAndProcessPdf            | subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy?: any                                                                                           | Promise<void>       | Downloads, caches, extracts, and processes text from a PDF document.                                                                                                                                    |
| getAndProcessHtml           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined, policy?: any                                                                        | Promise<void>       | Downloads, caches, extracts, and processes text from an HTML web page.                                                                                                                                   |
| getAndProcessPage           | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined                                                                                      | Promise<boolean>    | Determines the file type (PDF/HTML) and delegates to the appropriate processing method.                                                                           |
| getUrlsToFetch              | allPages: PsSearchResultItem[]                                                                                                                                                                         | string[]            | Selects a subset of URLs to fetch and process, removing duplicates.                                                                                               |
| getAllPages                 | (none)                                                                                                                                                                                                 | Promise<void>       | Orchestrates the browser automation to process all search result pages for different query types.                                                                 |
| process                     | (none)                                                                                                                                                                                                 | Promise<void>       | Main entry point for the agent; runs the full web page processing workflow.                                                                                       |

---

## Example

```typescript
import { BaseGetWebPagesOperationsAgent } from '@policysynth/agents/deepResearch/getWebPagesOperations.js';

const agent = new BaseGetWebPagesOperationsAgent({
  logger: console, // Provide a logger
  // ...other PolicySynthAgent config
});

(async () => {
  await agent.process();
  // The agent will fetch, analyze, and process web pages and PDFs,
  // outputting structured solution data for each.
})();
```

---

## Key Features

- **AI-Powered Solution Extraction:** Uses a system/human prompt pair to instruct the AI model to extract solutions from text, outputting a JSON array of solution objects.
- **Token Management & Chunking:** Automatically splits large texts into manageable chunks based on token limits for the AI model.
- **Caching:** Caches both HTML and PDF content locally (gzip-compressed) to avoid redundant downloads and speed up repeated runs.
- **Browser Automation:** Uses Puppeteer (with stealth plugin) to fetch and render web pages, supporting both headless and non-headless operation.
- **PDF Parsing:** Uses `pdfreader` to extract text from PDF files.
- **Duplicate Avoidance:** Tracks processed URLs to prevent redundant analysis.
- **Extensible:** Designed as a base class for more specialized web research agents.

---

## Output Format (AI Analysis)

The AI model is instructed to output solution data in the following JSON array format:

```json
[
  {
    "title": "string",
    "description": "string",
    "relevanceToProblem": "string",
    "mainBenefitOfSolutionComponent": "string",
    "mainObstacleToSolutionComponentAdoption": "string",
    "mainBenefitOfSolution": "string",
    "mainObstacleToSolutionAdoption": "string",
    "contacts": ["string"]
  }
]
```

---

## Notes

- The agent is intended for use in research, policy analysis, and solution discovery workflows.
- It is designed to be subclassed and extended for more specific use cases.
- The AI model type and size are currently hardcoded but can be made configurable.
- The agent expects a logger to be provided for debug/info/error output.

---

## Dependencies

- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) (with stealth plugin)
- [pdfreader](https://www.npmjs.com/package/pdfreader)
- [axios](https://www.npmjs.com/package/axios)
- [html-to-text](https://www.npmjs.com/package/html-to-text)
- [zlib](https://nodejs.org/api/zlib.html)
- [fs](https://nodejs.org/api/fs.html)
- [crypto](https://nodejs.org/api/crypto.html)
- [path](https://nodejs.org/api/path.html)

---

## See Also

- [`PolicySynthAgent`](../base/agent.js): The base agent class extended by this agent.
- [`PsSearchResultItem`](type definition): The type for search result items processed by this agent.

---