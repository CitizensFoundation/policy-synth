# WebPageScanner

This class extends `GetWebPagesProcessor` to scan web pages, extract and analyze their content, and collect the results based on a given JSON schema. It supports scanning both HTML and PDF web pages.

## Properties

| Name                   | Type                        | Description                                                                 |
|------------------------|-----------------------------|-----------------------------------------------------------------------------|
| jsonSchemaForResults   | string \| undefined         | JSON schema to structure the output results.                                |
| systemPromptOverride   | string \| undefined         | Custom prompt to override the default system prompt for scanning.           |
| collectedWebPages      | any[]                       | Array to collect the analyzed web pages data.                               |
| progressFunction       | Function \| undefined       | Function to report the progress of the scanning process.                    |

## Methods

| Name                    | Parameters                                                                                                      | Return Type                        | Description                                                                                   |
|-------------------------|------------------------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| renderScanningPrompt    | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number         | SystemMessage[]                    | Generates the scanning prompt messages based on the problem statement and text context.       |
| getTokenCount           | text: string, subProblemIndex: number \| undefined                                                              | Promise<{ totalTokenCount: number, promptTokenCount: object }> | Calculates the token count for the given text.                                               |
| getAIAnalysis           | text: string, subProblemIndex?: number, entityIndex?: number                                                    | Promise<IEngineWebPageAnalysisData> | Performs AI analysis on the given text and returns the analysis data.                        |
| getAllTextForTokenCheck | text: string, subProblemIndex: number \| undefined                                                              | string                             | Prepares all text for token count check by combining prompt messages and the given text.      |
| processPageText         | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy?: PSPolicy | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page, performs analysis, and collects the results.               |
| getAndProcessPage       | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                   | Determines the type of the web page (HTML or PDF) and processes it accordingly.              |
| scan                    | listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string \| undefined, progressFunction?: Function \| undefined | Promise<any[]>                     | Main method to start scanning the list of URLs, process each page, and collect the results.  |

## Example

```typescript
import { WebPageScanner } from '@policysynth/agents/webResearch/webPageScanner.js';
import puppeteer from 'puppeteer-extra';
import { PsBaseMemoryData, IEngineProblemStatement, IEngineWebPageAnalysisData, IEngineWebPageTypes, PSEvidenceWebPageTypes, PSRootCauseWebPageTypes, PSPolicy, PSRefinedRootCause } from 'your-types-definition-path';

(async () => {
  const memory: PsBaseMemoryData = {/* Your memory data structure */};
  const webPageScanner = new WebPageScanner(memory);

  const listOfUrls = ['https://example.com', 'https://anotherexample.com'];
  const jsonSchemaForResults = '{/* Your JSON schema */}';
  const scanSystemPrompt = 'Your custom scanning prompt';

  const progressFunction = (progress: string) => {
    console.log(`Scanning progress: ${progress}`);
  };

  const collectedWebPages = await webPageScanner.scan(listOfUrls, jsonSchemaForResults, scanSystemPrompt, progressFunction);

  console.log('Collected Web Pages:', collectedWebPages);
})();
```