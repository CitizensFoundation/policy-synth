# BaseGetWebPagesAgent

The `BaseGetWebPagesAgent` class is designed to fetch and process web pages, including HTML and PDF documents, to extract relevant information and analyze it using AI models. This class extends the `PolicySynthSimpleAgentBase` and utilizes various libraries such as Puppeteer, Puppeteer Stealth Plugin, PdfReader, and more.

## Properties

| Name              | Type   | Description                                                                 |
|-------------------|--------|-----------------------------------------------------------------------------|
| urlsScanned       | Set<string> | A set to keep track of URLs that have already been scanned.               |
| totalPagesSave    | number | Counter for the total number of pages saved.                                 |
| maxModelTokensOut | number | Maximum number of tokens for the model output.                               |
| modelTemperature  | number | Temperature setting for the model.                                           |

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

Generates a prompt for the AI model to analyze the text in the context of a problem statement.

### getTokenCount

```typescript
async getTokenCount(text: string, subProblemIndex: number | undefined): Promise<{ totalTokenCount: number, promptTokenCount: number }>
```

Calculates the total token count for the given text and sub-problem index.

### getAllTextForTokenCheck

```typescript
getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined): string
```

Combines the prompt messages and text for token count checking.

### isWithinTokenLimit

```typescript
isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean
```

Checks if the given text is within the token limit.

### splitText

```typescript
splitText(
  fullText: string,
  maxChunkTokenCount: number,
  subProblemIndex: number | undefined
): string[]
```

Splits the text into chunks based on the maximum token count.

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

Analyzes the text and splits it into chunks if necessary.

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

Processes the text of a page and saves the analysis.

### generateFileName

```typescript
generateFileName(url: string): string
```

Generates a file name based on the URL using SHA-256 hash.

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

Fetches and processes a PDF document.

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

Determines the type of page (PDF or HTML) and processes it accordingly.

### getUrlsToFetch

```typescript
getUrlsToFetch(allPages: PsSearchResultItem[]): string[]
```

Gets the URLs to fetch from the search results.

### getAllPages

```typescript
async getAllPages(): Promise<void>
```

Fetches all pages based on different search query types.

### process

```typescript
async process(): Promise<void>
```

Main method to start the web pages fetching and processing.

## Example

```typescript
import { BaseGetWebPagesAgent } from '@policysynth/agents/webResearch/getWebPages.js';

const agent = new BaseGetWebPagesAgent();
agent.process();
```

This example demonstrates how to create an instance of `BaseGetWebPagesAgent` and start the process of fetching and analyzing web pages.