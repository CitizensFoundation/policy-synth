# GetRootCausesWebPagesProcessor

This class extends `GetWebPagesProcessor` to specifically handle the retrieval and processing of web pages for the purpose of identifying various types of root causes within the text content of these pages. It utilizes AI models to analyze text and extract potential root causes related to different categories such as economic, scientific, cultural, etc.

## Properties

| Name                        | Type                                      | Description |
|-----------------------------|-------------------------------------------|-------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore               | An instance of `RootCauseWebPageVectorStore` used to store and manage vector data related to root cause web pages. |

## Methods

| Name                          | Parameters                                                                                                                                                                                                 | Return Type                                      | Description |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-------------|
| renderRootCauseScanningPrompt | type: PSRootCauseWebPageTypes, text: string                                                                                                                                                                | SystemMessage[]                                  | Renders the prompt for scanning a web page for root causes based on the provided type and text context. |
| getRootCauseTokenCount        | text: string, type: PSRootCauseWebPageTypes                                                                                                                                                                | Promise<{ totalTokenCount: number, promptTokenCount: { totalCount: number } }> | Calculates the total token count for a given text and type, considering the prompt token count. |
| getRootCauseTextAnalysis      | type: PSRootCauseWebPageTypes, text: string                                                                                                                                                                | Promise<PSRootCauseRawWebPageData \| PSRefinedRootCause[]> | Analyzes the text for root causes and returns the analysis data. |
| getRootCauseAIAnalysis        | type: PSRootCauseWebPageTypes, text: string                                                                                                                                                                | Promise<PSRootCauseRawWebPageData>               | Performs AI analysis on the text for the specified root cause type. |
| mergeAnalysisData             | data1: PSRootCauseRawWebPageData, data2: PSRootCauseRawWebPageData                                                                                                                                         | PSRootCauseRawWebPageData                        | Merges two sets of analysis data into one. |
| processPageText               | text: string, subProblemIndex: undefined = undefined, url: string, type: IEngineWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: undefined = undefined                  | Promise<void>                                    | Processes the text of a web page, performs root cause analysis, and stores the results. |
| getAndProcessRootCausePage    | url: string, browserPage: Page, type: PSRootCauseWebPageTypes                                                                                                                                              | Promise<boolean>                                 | Retrieves and processes a web page for root cause analysis based on the provided URL and type. |
| processRootCauses             | browser: Browser                                                                                                                                                                                            | Promise<void>                                    | Processes root causes for all relevant web pages using the provided browser instance. |
| getAllPages                   |                                                                                                                                                                                                             | Promise<void>                                    | Launches a browser, retrieves, and processes all relevant web pages for root cause analysis. |
| process                       |                                                                                                                                                                                                             | Promise<void>                                    | Main method to start the root cause web pages processing. |

## Example

```javascript
// Example usage of GetRootCausesWebPagesProcessor
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GetRootCausesWebPagesProcessor } from "@policysynth/agents/problems/web/getRootCausesWebPages.js";

// Apply the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const processor = new GetRootCausesWebPagesProcessor();

  // Assuming necessary setup and initialization steps are completed
  await processor.process();

  await browser.close();
})();
```