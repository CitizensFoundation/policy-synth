# GetEvidenceWebPagesProcessor

This class is responsible for processing web pages to extract evidence related to specific policy issues. It extends the `GetWebPagesProcessor` class and utilizes various methods to analyze text, manage browser interactions, and store results.

## Properties

| Name                        | Type                                  | Description                                       |
|-----------------------------|---------------------------------------|---------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore            | Store for evidence web page vectors.              |

## Methods

| Name                          | Parameters                                                                                   | Return Type                  | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderEvidenceScanningPrompt  | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string       | SystemMessage[] \| HumanMessage[] | Renders the prompt for evidence scanning based on the problem and policy.  |
| getEvidenceTokenCount         | text: string, subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes       | Promise<{ totalTokenCount: number, promptTokenCount: TokenCount }> | Calculates the token count for the evidence text.                          |
| getEvidenceTextAnalysis       | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string       | Promise<PSEvidenceRawWebPageData \| PSRefinedPolicyEvidence> | Analyzes the text for evidence and returns the analysis data.              |
| getEvidenceAIAnalysis         | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string       | Promise<PSEvidenceRawWebPageData> | Gets AI analysis for the given text.                                       |
| mergeAnalysisData             | data1: PSEvidenceRawWebPageData, data2: PSEvidenceRawWebPageData                            | PSEvidenceRawWebPageData    | Merges two sets of analysis data into one.                                 |
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: PsWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | void | Processes the text of a web page for evidence analysis.                    |
| getAndProcessEvidencePage     | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise<boolean>            | Processes an evidence page using a browser instance.                       |
| processSubProblems            | browser: Browser                                                                             | Promise<void>               | Processes all sub-problems related to the policies.                        |
| getAllPages                   | -                                                                                            | Promise<void>               | Initiates the process to get and analyze all relevant pages.               |
| process                       | -                                                                                            | Promise<void>               | Main method to start the evidence page processing.                         |

## Example

```typescript
// Example usage of GetEvidenceWebPagesProcessor
import { GetEvidenceWebPagesProcessor } from '@policysynth/agents/policies/web/getEvidenceWebPages.js';

const processor = new GetEvidenceWebPagesProcessor();
processor.process().then(() => {
  console.log('Evidence pages processing complete.');
}).catch(error => {
  console.error('Error processing evidence pages:', error);
});
```