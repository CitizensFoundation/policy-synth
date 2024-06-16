# GetRefinedRootCausesProcessor

This class processes refined root causes from web pages, extending the functionality of `GetRootCausesWebPagesProcessor`.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| logger        | Logger | Logger for logging information, warnings, and errors. |
| memory        | Memory | Memory storage for processed data. |
| chat          | ChatOpenAI | Instance of ChatOpenAI for interacting with OpenAI's models. |
| totalPagesSave| number | Counter for the total number of pages processed and saved. |

## Methods

| Name                                  | Parameters                                                                 | Return Type            | Description                                                                 |
|---------------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderRootCauseScanningPrompt         | type: PSRootCauseWebPageTypes, text: string                                | SystemMessage[]        | Renders the prompt for scanning root causes based on the type and text.     |
| getRootCauseRefinedTextAnalysis       | type: PSRootCauseWebPageTypes, text: string, url: string                   | Promise<PSRefinedRootCause[]> | Analyzes text for refined root causes and updates memory with results.     |
| getRefinedRootCauseTextAIAnalysis     | type: PSRootCauseWebPageTypes, text: string                                | Promise<PSRefinedRootCause[]> | Gets AI analysis for refined root causes from the provided text.           |
| mergeRefinedAnalysisData              | data1: PSRefinedRootCause, data2: PSRefinedRootCause                       | PSRefinedRootCause     | Merges two refined root cause data objects into one.                        |
| processPageText                       | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<PSRefinedRootCause[]> | Processes the text of a page for refined root causes.                       |
| getAndProcessRootCausePage            | url: string, browserPage: Page, type: PSRootCauseWebPageTypes              | Promise<boolean>       | Processes a specific root cause page based on the URL and type.             |
| refineWebRootCauses                   | page: Page                                                                 | Promise<void>          | Refines root causes from web pages using a browser page instance.           |
| getAllPages                           | -                                                                          | Promise<void>          | Launches a browser to refine root causes from all relevant web pages.       |
| process                               | -                                                                          | Promise<void>          | Main processing method to refine root causes from web pages.                |

## Example

```typescript
import { GetRefinedRootCausesProcessor } from '@policysynth/agents/problems/web/getRefinedRootCauses.js';

const processor = new GetRefinedRootCausesProcessor();
processor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```