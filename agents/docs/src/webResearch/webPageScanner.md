# WebPageScanner

WebPageScanner extends GetWebPagesProcessor to scan web pages and process their content for analysis.

## Properties

| Name                   | Type                                      | Description |
|------------------------|-------------------------------------------|-------------|
| jsonSchemaForResults   | string \| undefined                       | JSON schema for the results of scanning. |
| systemPromptOverride   | string \| undefined                       | Custom prompt to override the default system prompt. |
| collectedWebPages      | any[]                                     | Array to collect web pages after processing. |
| progressFunction       | Function \| undefined                     | Function to report progress during scanning. |

## Methods

| Name                    | Parameters                                                                                                      | Return Type                             | Description |
|-------------------------|------------------------------------------------------------------------------------------------------------------|-----------------------------------------|-------------|
| renderScanningPrompt    | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number         | SystemMessage[] \| HumanMessage[]      | Renders the scanning prompt based on the problem statement and text context. |
| getTokenCount           | text: string, subProblemIndex: number \| undefined                                                              | Promise<{ totalTokenCount: number, promptTokenCount: object }> | Calculates the token count for a given text. |
| getAIAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number                                                    | Promise<IEngineWebPageAnalysisData>    | Gets AI analysis for the given text. |
| getAllTextForTokenCheck | text: string, subProblemIndex: number \| undefined                                                              | string                                  | Gets all text for token count check. |
| processPageText         | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy?: PSPolicy | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page. |
| getAndProcessPage       | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                       | Gets and processes a web page. |
| scan                    | listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string \| undefined, progressFunction?: Function \| undefined | Promise<any[]>                         | Scans a list of URLs and processes their content. |

## Example

```
// Example usage of WebPageScanner
import { WebPageScanner } from '@policysynth/agents/webResearch/webPageScanner.js';

const scanner = new WebPageScanner();
scanner.scan(
  ['https://example.com'],
  'Your JSON Schema for Results',
  'Your Custom System Prompt',
  (progress) => console.log(progress)
).then((collectedPages) => {
  console.log(collectedPages);
});
```