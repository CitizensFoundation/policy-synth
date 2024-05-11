# GetRootCausesWebPagesProcessor

This class processes web pages to identify and analyze root causes related to specific problem statements. It extends the `GetWebPagesProcessor` class.

## Properties

| Name                          | Type                                  | Description                                       |
|-------------------------------|---------------------------------------|---------------------------------------------------|
| rootCauseWebPageVectorStore   | RootCauseWebPageVectorStore           | Store for root cause web page vectors.            |
| hasPrintedPrompt              | boolean                               | Flag to check if the prompt has been printed.     |
| processesUrls                 | Set<string>                           | Set to track URLs that have been processed.       |

## Methods

| Name                          | Parameters                                                                 | Return Type                                     | Description                                                                 |
|-------------------------------|---------------------------------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------|
| renderRootCauseScanningPrompt | type: PSRootCauseWebPageTypes, text: string                              | [SystemMessage, HumanMessage]                   | Renders the prompt for scanning root causes in a given text.                |
| getRootCauseTokenCount        | text: string, type: PSRootCauseWebPageTypes                              | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Calculates the token count for the root cause analysis prompt and text.     |
| getRootCauseTextAnalysis      | type: PSRootCauseWebPageTypes, text: string, url: string                 | Promise<PSRootCauseRawWebPageData \| PSRefinedRootCause[]> | Analyzes the text for root causes and returns the analysis.                 |
| getRootCauseAIAnalysis        | type: PSRootCauseWebPageTypes, text: string                              | Promise<PSRefinedRootCause[]>                   | Gets AI analysis for root causes from the given text.                       |
| isUrlInSubProblemMemory       | url: string                                                               | boolean                                         | Checks if the URL is already stored in sub-problem memory.                  |
| processPageText               | text: string, subProblemIndex: undefined, url: string, type: IEngineWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: undefined | Promise<void>                                  | Processes the text of a page for root cause analysis.                       |
| getAndProcessRootCausePage    | url: string, browserPage: Page, type: PSRootCauseWebPageTypes            | Promise<boolean>                                | Processes a specific root cause page.                                       |
| processRootCauses             | browser: Browser                                                          | Promise<void>                                   | Processes all root causes from the pages loaded in the browser.             |
| getAllPages                   |                                                                           | Promise<void>                                   | Launches a browser and processes all root causes from the pages.            |
| process                       |                                                                           | Promise<void>                                   | Main processing function to handle root cause analysis for web pages.       |

## Example

```typescript
// Example usage of GetRootCausesWebPagesProcessor
import { GetRootCausesWebPagesProcessor } from '@policysynth/agents/problems/web/getRootCausesWebPages.js';
import puppeteer from 'puppeteer';

async function analyzeRootCauses() {
  const browser = await puppeteer.launch({ headless: true });
  const processor = new GetRootCausesWebPagesProcessor();
  await processor.process();
  await browser.close();
}

analyzeRootCauses();
```