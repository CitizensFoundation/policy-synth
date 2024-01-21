# GetRefinedEvidenceProcessor

This class is responsible for refining evidence from web pages related to policy proposals. It extends the `GetEvidenceWebPagesProcessor` class and utilizes various methods to analyze text, process pages, and refine evidence.

## Properties

| Name                            | Type                                  | Description                                                                 |
|---------------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| chat                            | ChatOpenAI                            | Instance of ChatOpenAI used for communication with OpenAI's language models.|
| evidenceWebPageVectorStore      | EvidenceWebPageVectorStore            | Store for evidence web page vectors.                                        |
| logger                          | Logger                                | Logging instance for recording events and errors.                           |
| memory                          | IEngineInnovationMemoryData           | Memory data for the engine's current state.                                 |
| totalPagesSave                  | number                                | Counter for the total number of pages saved after processing.               |

## Methods

| Name                               | Parameters                                                                 | Return Type            | Description                                                                                   |
|------------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| renderEvidenceScanningPrompt       | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | SystemMessage[], HumanMessage[] | Renders the prompt for scanning evidence related to a policy.                                 |
| getEvidenceTextAnalysis            | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSRefinedPolicyEvidence> | Analyzes the evidence text and returns a refined analysis.                                    |
| getRefinedEvidenceTextAIAnalysis   | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSRefinedPolicyEvidence> | Gets refined evidence analysis from AI based on the provided text.                            |
| mergeRefinedAnalysisData           | data1: PSRefinedPolicyEvidence, data2: PSRefinedPolicyEvidence             | PSRefinedPolicyEvidence | Merges two sets of refined analysis data into one.                                            |
| processPageText                    | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void>           | Processes the text of a web page and saves the refined analysis.                              |
| getAndProcessEvidencePage          | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise<boolean>        | Retrieves and processes evidence from a web page.                                             |
| refineWebEvidence                  | policy: PSPolicy, subProblemIndex: number, page: Page                       | Promise<void>           | Refines web evidence for a given policy and sub-problem index.                                |
| processSubProblems                 | browser: Browser                                                            | Promise<void>           | Processes sub-problems to refine evidence across multiple policies.                           |
| getAllPages                        | -                                                                          | Promise<void>           | Launches a browser and processes all pages to refine evidence.                                |
| process                            | -                                                                          | Promise<void>           | Main method that orchestrates the evidence refinement process.                                |

## Examples

```typescript
// Example usage of the GetRefinedEvidenceProcessor class
const getRefinedEvidenceProcessor = new GetRefinedEvidenceProcessor();
getRefinedEvidenceProcessor.process().then(() => {
  console.log(`Refined ${getRefinedEvidenceProcessor.totalPagesSave} pages`);
}).catch(error => {
  console.error("Error during evidence refinement process:", error);
});
```

Note: The actual implementation of the methods and their interactions with external services like OpenAI's language models, Weaviate vector store, and Puppeteer for web page processing are abstracted and not shown in the example.