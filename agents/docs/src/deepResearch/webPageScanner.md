# WebPageScanner

The `WebPageScanner` class is an advanced agent for scanning, analyzing, and collecting data from web pages using Puppeteer and AI-powered analysis. It extends the `BaseGetWebPagesAgent` and is designed to automate the process of visiting a list of URLs, extracting text, and running AI analysis on the content according to a provided JSON schema.

## Properties

| Name                   | Type                                   | Description                                                                                 |
|------------------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| jsonSchemaForResults   | `string \| undefined`                  | JSON schema string that defines the expected structure of AI analysis results.              |
| systemPromptOverride   | `string \| undefined`                  | Optional system prompt to override the default prompt for AI analysis.                      |
| collectedWebPages      | `any[]`                                | Array to store the results of analyzed web pages.                                           |
| progressFunction       | `Function \| undefined`                | Optional function to report progress during scanning.                                       |

## Constructor

```typescript
constructor(memory: PsSimpleAgentMemoryData)
```
- **memory**: The agent's memory object, used for state and context.

## Methods

| Name                    | Parameters                                                                                                                                                                                                 | Return Type                | Description                                                                                                   |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| renderScanningPrompt    | `problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number`                                                                                                                    | `any[]`                    | Renders the prompt messages (system and human) for the AI model, using the schema and context.                |
| getAIAnalysis           | `text: string, subProblemIndex?: number, entityIndex?: number`                                                                                                                                             | `Promise<any>`             | Runs the AI analysis on the provided text using the rendered prompt and returns the analysis result.           |
| getAllTextForTokenCheck | `text: string, subProblemIndex: number \| undefined`                                                                                                                                                       | `string`                   | Returns the full prompt and text for token counting or validation.                                             |
| processPageText         | `text: string, subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined`                                                        | `Promise<void \| any[]>`    | Processes the text of a page, runs AI analysis, and stores the result.                                         |
| getAndProcessPage       | `subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined`                                                                                        | `Promise<true>`            | Determines if the URL is a PDF or HTML and processes it accordingly.                                           |
| scan                    | `listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string \| undefined, progressFunction?: Function \| undefined`                                                                     | `Promise<any[]>`           | Main entry point: launches browser, iterates URLs, processes each, and returns all collected web page results. |

## Example

```typescript
import { WebPageScanner } from '@policysynth/agents/deepResearch/webPageScanner.js';

// Example memory object (should be constructed as needed)
const memory = {
  groupId: 1,
  // ...other PsSimpleAgentMemoryData fields
};

const scanner = new WebPageScanner(memory);

const urls = [
  "https://example.com/news1",
  "https://example.com/news2"
];

const jsonSchema = `
{
  "type": "object",
  "properties": {
    "headline": { "type": "string" },
    "summary": { "type": "string" }
  },
  "required": ["headline", "summary"]
}
`;

(async () => {
  const results = await scanner.scan(
    urls,
    jsonSchema,
    "Scan these news articles for headline and summary.",
    (progress) => console.log("Progress:", progress)
  );
  console.log("Scan results:", results);
})();
```

---

**Note:**  
- This class is intended for use in automated research, data extraction, and AI-powered web page analysis workflows.
- It requires Puppeteer and an AI model integration (via `callLLM`).
- The `scan` method is the main entry point for batch processing a list of URLs.  
- The class is extensible for custom prompts, schemas, and progress reporting.