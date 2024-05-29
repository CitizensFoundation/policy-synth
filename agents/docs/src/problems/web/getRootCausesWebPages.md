# GetRootCausesWebPagesProcessor

The `GetRootCausesWebPagesProcessor` class is responsible for processing web pages to identify and analyze root causes for a particular problem statement. It extends the `GetWebPagesProcessor` class and utilizes various tools and libraries such as Puppeteer, Redis, and OpenAI's ChatGPT for its operations.

## Properties

| Name                        | Type                              | Description                                                                 |
|-----------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore       | Instance of the RootCauseWebPageVectorStore for storing root cause vectors. |
| hasPrintedPrompt            | boolean                           | Flag to check if the prompt has been printed.                               |
| outputInLanguage            | string \| undefined               | Language in which the output should be generated.                           |
| processesUrls               | Set<string>                       | Set of URLs that have been processed.                                       |

## Methods

| Name                          | Parameters                                                                 | Return Type                              | Description                                                                                       |
|-------------------------------|----------------------------------------------------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------|
| renderRootCauseScanningPrompt | type: PSRootCauseWebPageTypes, text: string                                | (SystemMessage \| HumanMessage)[]        | Renders the prompt for root cause scanning.                                                       |
| getRootCauseTokenCount        | text: string, type: PSRootCauseWebPageTypes                                | Promise<{ totalTokenCount: number; promptTokenCount: any; }> | Gets the token count for the root cause text analysis.                                            |
| getRootCauseTextAnalysis      | type: PSRootCauseWebPageTypes, text: string, url: string                   | Promise<PSRootCauseRawWebPageData \| PSRefinedRootCause[]> | Analyzes the root cause text and returns the analysis results.                                    |
| getRootCauseAIAnalysis        | type: PSRootCauseWebPageTypes, text: string                                | Promise<PSRefinedRootCause[]>            | Gets the AI analysis for the root cause text.                                                     |
| isUrlInSubProblemMemory       | url: string                                                               | boolean                                  | Checks if the URL is already in the sub-problem memory.                                           |
| processPageText               | text: string, subProblemIndex: undefined, url: string, type: IEngineWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: undefined | Promise<void>                              | Processes the text of a web page for root cause analysis.                                         |
| getAndProcessRootCausePage    | url: string, browserPage: Page, type: PSRootCauseWebPageTypes              | Promise<boolean>                         | Gets and processes a root cause page.                                                             |
| processRootCauses             | browser: Browser                                                          | Promise<void>                            | Processes the root causes using the browser instance.                                             |
| getAllPages                   | none                                                                      | Promise<void>                            | Gets and processes all pages for root cause analysis.                                             |
| process                       | none                                                                      | Promise<void>                            | Main process method to initiate the root cause web pages processing.                              |

## Example

```typescript
import { GetRootCausesWebPagesProcessor } from '@policysynth/agents/problems/web/getRootCausesWebPages.js';

const processor = new GetRootCausesWebPagesProcessor();
processor.process();
```

This example demonstrates how to create an instance of `GetRootCausesWebPagesProcessor` and initiate the processing of root cause web pages.