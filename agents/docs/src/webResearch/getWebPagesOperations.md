# BaseGetWebPagesOperationsAgent

The `BaseGetWebPagesOperationsAgent` class is designed to fetch, process, and analyze web pages and PDFs. It uses Puppeteer for web scraping, PDFReader for reading PDFs, and various other libraries for processing and analyzing the content.

## Properties

| Name              | Type                | Description                                      |
|-------------------|---------------------|--------------------------------------------------|
| urlsScanned       | Set<string>         | A set to keep track of URLs that have been scanned. |
| totalPagesSave    | number              | Counter for the total number of pages saved.     |
| maxModelTokensOut | number              | Maximum number of tokens for the model output.   |
| modelTemperature  | number              | Temperature setting for the model.               |

## Methods

### renderScanningPrompt

```typescript
renderScanningPrompt(
  problemStatement: string,
  text: string,
  subProblemIndex?: number,
  entityIndex?: number
): string[]
```

Generates a prompt for scanning text.

### getTokenCount

```typescript
async getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{ totalTokenCount: number, promptTokenCount: number }>
```

Calculates the token count for the given text.

### getAllTextForTokenCheck

```typescript
getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string
```

Gets all text for token check.

### isWithinTokenLimit

```typescript
isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean
```

Checks if the text is within the token limit.

### splitText

```typescript
splitText(
  fullText: string,
  maxChunkTokenCount: number,
  subProblemIndex: number | undefined
): string[]
```

Splits the text into chunks based on the token limit.

### getAIAnalysis

```typescript
async getAIAnalysis(
  text: string,
  subProblemIndex?: number,
  entityIndex?: number
): Promise<any>
```

Gets AI analysis for the given text.

### getTextAnalysis

```typescript
async getTextAnalysis(
  text: string,
  subProblemIndex?: number,
  entityIndex?: number
): Promise<any[]>
```

Analyzes the text and returns the analysis.

### processPageText

```typescript
async processPageText(
  text: string,
  subProblemIndex: number | undefined,
  url: string,
  type: any,
  entityIndex: number | undefined,
  policy: any | undefined = undefined
): Promise<void | any[]>
```

Processes the text of a page.

### generateFileName

```typescript
generateFileName(url: string): string
```

Generates a file name based on the URL.

### getAndProcessPdf

```typescript
async getAndProcessPdf(
  subProblemIndex: number | undefined,
  url: string,
  type: any,
  entityIndex: number | undefined,
  policy: any | undefined = undefined
): Promise<void>
```

Fetches and processes a PDF.

### getAndProcessHtml

```typescript
async getAndProcessHtml(
  subProblemIndex: number | undefined,
  url: string,
  browserPage: Page,
  type: any,
  entityIndex: number | undefined,
  policy: any | undefined = undefined
): Promise<void>
```

Fetches and processes an HTML page.

### getAndProcessPage

```typescript
async getAndProcessPage(
  subProblemIndex: number | undefined,
  url: string,
  browserPage: Page,
  type: any,
  entityIndex: number | undefined
): Promise<boolean>
```

Fetches and processes a page (either HTML or PDF).

### getUrlsToFetch

```typescript
getUrlsToFetch(allPages: PsSearchResultItem[]): string[]
```

Gets the URLs to fetch from the search results.

### getAllPages

```typescript
async getAllPages(): Promise<void>
```

Fetches all pages.

### process

```typescript
async process(): Promise<void>
```

Main method to start the process of fetching and analyzing web pages.

## Example

```typescript
import { BaseGetWebPagesOperationsAgent } from '@policysynth/agents/webResearch/getWebPagesOperations.js';

const agent = new BaseGetWebPagesOperationsAgent();
agent.process();
```

This class provides a comprehensive solution for fetching, processing, and analyzing web pages and PDFs using various tools and libraries. The methods are designed to handle different types of content and ensure that the analysis is accurate and efficient.