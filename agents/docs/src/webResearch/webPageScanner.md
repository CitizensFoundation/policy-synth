# WebPageScanner

This class is responsible for scanning web pages and processing their content for analysis. It extends the `GetWebPagesProcessor` class and utilizes various methods to fetch, analyze, and store data from web pages.

## Properties

| Name                  | Type                        | Description                                       |
|-----------------------|-----------------------------|---------------------------------------------------|
| jsonSchemaForResults  | string \| undefined         | JSON schema to structure the results.             |
| systemPromptOverride  | string \| undefined         | Custom prompt to override the default system prompt. |
| collectedWebPages     | any[]                       | Array to store the processed web page data.       |
| progressFunction      | Function \| undefined       | Function to report the progress of scanning.      |

## Methods

| Name                    | Parameters                                                                 | Return Type                        | Description                                                                 |
|-------------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| constructor             | memory: PsBaseMemoryData                                                   |                                    | Initializes the scanner with memory data.                                   |
| renderScanningPrompt    | problemStatement: PsProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number | SystemMessage[] \| HumanMessage[] | Generates the scanning prompt messages based on the provided text and context. |
| getTokenCount           | text: string, subProblemIndex: number \| undefined                         | Promise<{ totalTokenCount: number, promptTokenCount: any }> | Calculates the token count for the given text.                              |
| getAIAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number               | Promise<PsWebPageAnalysisData> | Performs AI analysis on the provided text and returns the analysis data.    |
| getAllTextForTokenCheck | text: string, subProblemIndex: number \| undefined                         | string                             | Prepares all text for token count checking.                                 |
| processPageText         | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy?: PSPolicy | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page and stores the analysis.                   |
| getAndProcessPage       | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                   | Fetches and processes a web page based on the URL and type.                 |
| scan                    | listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt: string \| undefined, progressFunction: Function \| undefined | Promise<any[]>                     | Scans a list of URLs, processes their content, and returns the collected data. |

## Example

```typescript
import { WebPageScanner } from '@policysynth/agents/webResearch/webPageScanner.js';

const scanner = new WebPageScanner(memoryData);
scanner.scan(
  ['https://example.com'],
  '{"type": "object", "properties": {"title": {"type": "string"}}}',
  "Custom prompt for scanning",
  (progress) => console.log(progress)
).then((results) => {
  console.log(results);
});
```