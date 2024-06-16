# GetRefinedEvidenceProcessor

This class extends `GetEvidenceWebPagesProcessor` to refine web evidence for policy analysis by processing text from web pages and generating refined evidence analysis using AI models.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| totalPagesSave | number | Tracks the total number of pages saved after processing. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| renderEvidenceScanningPrompt | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | SystemMessage[], HumanMessage[] | Renders the prompt for scanning evidence related to a policy. |
| getEvidenceTextAnalysis | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSRefinedPolicyEvidence> | Analyzes the text for evidence and returns refined evidence data. |
| getRefinedEvidenceTextAIAnalysis | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSRefinedPolicyEvidence> | Gets refined evidence analysis using AI based on the provided text. |
| mergeRefinedAnalysisData | data1: PSRefinedPolicyEvidence, data2: PSRefinedPolicyEvidence | PSRefinedPolicyEvidence | Merges two sets of refined analysis data into one. |
| processPageText | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text from a web page for evidence analysis. |
| getAndProcessEvidencePage | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise<boolean> | Processes a web page for evidence, handling both HTML and PDF content. |
| refineWebEvidence | policy: PSPolicy, subProblemIndex: number, page: Page | Promise<void> | Refines web evidence for a given policy and sub-problem index. |
| processSubProblems | browser: Browser | Promise<void> | Processes sub-problems to refine evidence across multiple policies. |
| getAllPages |  | Promise<void> | Manages the browser instance to process all pages for evidence refinement. |
| process |  | Promise<void> | Initiates the process of refining evidence from web pages. |

## Example

```typescript
// Example usage of GetRefinedEvidenceProcessor
import { GetRefinedEvidenceProcessor } from '@policysynth/agents/policies/web/getRefinedEvidence.js';
import puppeteer from "puppeteer";

async function processEvidence() {
  const browser = await puppeteer.launch({ headless: true });
  const processor = new GetRefinedEvidenceProcessor();

  await processor.process();
  await browser.close();
}

processEvidence();
```