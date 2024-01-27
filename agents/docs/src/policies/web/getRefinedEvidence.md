# GetRefinedEvidenceProcessor

This class extends `GetEvidenceWebPagesProcessor` to refine web evidence for policy analysis. It processes web pages, extracts and refines evidence related to policy proposals, and updates the evidence with refined analysis.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for generating refined evidence analysis. |
| totalPagesSave| number | Tracks the total number of pages saved after refining evidence. |

## Methods

| Name                                  | Parameters                                                                                      | Return Type | Description                                                                 |
|---------------------------------------|-------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderEvidenceScanningPrompt          | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string          | Array       | Generates the prompt for scanning web page evidence.                       |
| getEvidenceTextAnalysis               | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string          | Promise     | Analyzes the text of web pages for evidence relevant to a policy.          |
| getRefinedEvidenceTextAIAnalysis      | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string          | Promise     | Gets refined evidence analysis from AI for a given text.                    |
| mergeRefinedAnalysisData              | data1: PSRefinedPolicyEvidence, data2: PSRefinedPolicyEvidence                                  | PSRefinedPolicyEvidence | Merges two sets of refined policy evidence analysis.                        |
| processPageText                       | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise     | Processes the text of a web page for evidence analysis.                    |
| getAndProcessEvidencePage             | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise     | Processes a single evidence web page.                                      |
| refineWebEvidence                     | policy: PSPolicy, subProblemIndex: number, page: Page                                            | Promise     | Refines web evidence for a given policy and sub-problem index.             |
| processSubProblems                    | browser: Browser                                                                                | Promise     | Processes sub-problems to refine web evidence for each.                    |
| getAllPages                           |                                                                                                 | Promise     | Launches a browser to process and refine web evidence across all pages.    |
| process                               |                                                                                                 | Promise     | Main method to start the process of refining web evidence.                 |

## Example

```javascript
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GetRefinedEvidenceProcessor } from "@policysynth/agents/policies/web/getRefinedEvidence.js";

// Apply the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

async function refineEvidence() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const processor = new GetRefinedEvidenceProcessor();

  // Example policy and subProblemIndex
  const policy = {
    title: "Example Policy",
    description: "A policy to improve urban green spaces.",
    vectorStoreId: "exampleVectorStoreId"
  };
  const subProblemIndex = 0;

  await processor.refineWebEvidence(policy, subProblemIndex, page);

  await browser.close();
}

refineEvidence().then(() => console.log("Evidence refinement complete."));
```