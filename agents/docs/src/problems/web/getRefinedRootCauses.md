# GetRefinedRootCausesProcessor

This class extends `GetRootCausesWebPagesProcessor` to refine root causes from web pages. It processes web pages to extract and refine root causes related to a specific problem statement, utilizing AI models for text analysis.

## Methods

| Name                               | Parameters                                                                                   | Return Type                  | Description                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| renderRootCauseScanningPrompt      | type: PSRootCauseWebPageTypes, text: string                                                 | SystemMessage[]              | Generates prompt messages for scanning root causes in a given text.                          |
| getRootCauseRefinedTextAnalysis    | type: PSRootCauseWebPageTypes, text: string, url: string                                     | Promise<PSRefinedRootCause[]\|undefined> | Analyzes text to refine root causes, considering token limits and splitting text if necessary. |
| getRefinedRootCauseTextAIAnalysis  | type: PSRootCauseWebPageTypes, text: string                                                  | Promise<PSRefinedRootCause[]> | Uses AI to analyze and extract refined root causes from text.                                 |
| mergeRefinedAnalysisData           | data1: PSRefinedRootCause, data2: PSRefinedRootCause                                         | PSRefinedRootCause           | Merges two sets of refined root cause analysis data.                                          |
| processPageText                    | text: string, subProblemIndex: number \| undefined, url: string, type: VariousTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<any>                 | Processes the text of a web page to refine root causes.                                       |
| getAndProcessRootCausePage         | url: string, browserPage: Page, type: PSRootCauseWebPageTypes                                | Promise<boolean>             | Processes a web page or PDF to refine root causes.                                            |
| refineWebRootCauses                | page: Page                                                                                    | Promise<void>                | Refines root causes from web pages, iterating through different types.                        |
| getAllPages                        | -                                                                                            | Promise<void>                | Launches a browser to refine root causes from all relevant web pages.                         |
| process                            | -                                                                                            | Promise<void>                | Main method to start the process of refining root causes from web pages.                      |

## Example

```javascript
// Example usage of GetRefinedRootCausesProcessor
import { GetRefinedRootCausesProcessor } from '@policysynth/agents/problems/web/getRefinedRootCauses.js';
import puppeteer from 'puppeteer-extra';

(async () => {
  const processor = new GetRefinedRootCausesProcessor();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await processor.refineWebRootCauses(page);

  await browser.close();
})();
```