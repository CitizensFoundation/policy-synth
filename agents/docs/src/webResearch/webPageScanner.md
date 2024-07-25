# WebPageScanner

The `WebPageScanner` class extends the `BaseGetWebPagesAgent` and is designed to scan web pages, analyze their content using AI, and collect the results. It uses Puppeteer for web scraping and provides methods to process both HTML and PDF content.

## Properties

| Name                  | Type                          | Description                                                                 |
|-----------------------|-------------------------------|-----------------------------------------------------------------------------|
| jsonSchemaForResults  | `string \| undefined`         | JSON schema to validate the results against.                                |
| systemPromptOverride  | `string \| undefined`         | Custom system prompt for the AI analysis.                                   |
| collectedWebPages     | `any[]`                       | Array to store the collected web pages' analysis results.                   |
| progressFunction      | `Function \| undefined`       | Function to report the progress of the scanning process.                    |

## Methods

| Name                   | Parameters                                                                                                      | Return Type          | Description                                                                                       |
|------------------------|-----------------------------------------------------------------------------------------------------------------|----------------------|---------------------------------------------------------------------------------------------------|
| constructor            | `memory: PsSimpleAgentMemoryData`                                                                               | `void`               | Initializes a new instance of the `WebPageScanner` class.                                         |
| renderScanningPrompt   | `problemStatement: string, text: string, subProblemIndex?: number, entityIndex?: number`                        | `string[]`           | Renders the scanning prompt for the AI analysis.                                                  |
| getAIAnalysis          | `text: string, subProblemIndex?: number, entityIndex?: number`                                                  | `Promise<any>`       | Gets the AI analysis for the provided text.                                                       |
| getAllTextForTokenCheck| `text: string, subProblemIndex: number \| undefined`                                                            | `string`             | Gets all text for token check.                                                                    |
| processPageText        | `text: string, subProblemIndex: number \| undefined, url: string, type: any, entityIndex: number \| undefined, policy: any \| undefined = undefined` | `Promise<void \| any[]>` | Processes the text of a page and collects the analysis results.                                    |
| getAndProcessPage      | `subProblemIndex: number \| undefined, url: string, browserPage: Page, type: any, entityIndex: number \| undefined` | `Promise<boolean>`   | Gets and processes a page (either HTML or PDF).                                                   |
| scan                   | `listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt: string \| undefined = undefined, progressFunction: Function \| undefined = undefined` | `Promise<any[]>`     | Scans a list of URLs, processes their content, and collects the results.                          |

## Example

```typescript
import { WebPageScanner } from '@policysynth/agents/webResearch/webPageScanner.js';

const memory = {
  // Initialize memory data
};

const scanner = new WebPageScanner(memory);

const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
];

const jsonSchema = `
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "content": { "type": "string" }
  },
  "required": ["title", "content"]
}
`;

const results = await scanner.scan(urls, jsonSchema);

console.log(results);
```

This example demonstrates how to initialize the `WebPageScanner` class, scan a list of URLs, and log the collected results.