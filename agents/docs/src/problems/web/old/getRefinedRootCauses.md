# GetRefinedRootCausesProcessor

The `GetRefinedRootCausesProcessor` class is responsible for refining root cause analysis from web pages. It extends the `GetRootCausesWebPagesProcessor` class and utilizes various methods to process and analyze text from web pages to identify root causes.

## Properties

| Name   | Type | Description |
|--------|------|-------------|
| redis  | ioredis.Redis | Redis client instance for caching and data storage. |

## Methods

| Name                                | Parameters                                                                 | Return Type            | Description                                                                 |
|-------------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderRootCauseScanningPrompt       | type: PSRootCauseWebPageTypes, text: string                                | (SystemMessage \| HumanMessage)[] | Renders the prompt for root cause scanning.                                 |
| getRootCauseRefinedTextAnalysis     | type: PSRootCauseWebPageTypes, text: string, url: string                   | Promise<PSRefinedRootCause[]> | Analyzes the text to identify refined root causes.                          |
| getRefinedRootCauseTextAIAnalysis   | type: PSRootCauseWebPageTypes, text: string                                | Promise<PSRefinedRootCause[]> | Calls the AI model to get refined root cause analysis.                      |
| mergeRefinedAnalysisData            | data1: PSRefinedRootCause, data2: PSRefinedRootCause                       | PSRefinedRootCause     | Merges two refined analysis data objects.                                   |
| processPageText                     | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<any> | Processes the text of a web page to identify root causes.                  |
| getAndProcessRootCausePage          | url: string, browserPage: Page, type: PSRootCauseWebPageTypes              | Promise<boolean>       | Retrieves and processes a web page to identify root causes.                 |
| refineWebRootCauses                 | page: Page                                                                 | Promise<void>          | Refines root causes from web pages.                                         |
| getAllPages                         |                                                                            | Promise<void>          | Retrieves and processes all relevant web pages for root cause analysis.     |
| process                             |                                                                            | Promise<void>          | Main process method to start the refined root causes web pages processor.   |

## Example

```typescript
import { GetRefinedRootCausesProcessor } from '@policysynth/agents/problems/web/old/getRefinedRootCauses.js';

const processor = new GetRefinedRootCausesProcessor();
processor.process();
```

This example demonstrates how to instantiate and use the `GetRefinedRootCausesProcessor` class to start the refined root causes web pages processor.