# GetEvidenceWebPagesProcessor

The `GetEvidenceWebPagesProcessor` class is responsible for processing web pages to extract evidence related to specific policy proposals. It extends the `GetWebPagesProcessor` class and utilizes various methods to analyze text, manage browser interactions, and store evidence data.

## Properties

| Name                         | Type                                      | Description                                                                 |
|------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| evidenceWebPageVectorStore   | EvidenceWebPageVectorStore                | An instance of `EvidenceWebPageVectorStore` to handle evidence data storage.|
| totalPagesSave               | number                                    | A counter for the total number of pages saved during processing.            |
| chat                         | ChatOpenAI                                | An instance of `ChatOpenAI` for interacting with OpenAI's language models.  |
| memory                       | IEngineInnovationMemoryData \| undefined  | Memory data related to the engine's current state.                          |
| logger                       | Logger                                    | A logging instance for outputting logs.                                     |

## Methods

| Name                          | Parameters                                                                 | Return Type                     | Description                                                                                   |
|-------------------------------|----------------------------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| renderEvidenceScanningPrompt  | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Array<SystemMessage \| HumanMessage> | Renders the prompt for evidence scanning based on the given parameters.                       |
| getEvidenceTokenCount         | text: string, subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes | Promise<{ totalTokenCount: number, promptTokenCount: number }> | Calculates the token count for the evidence text analysis.                                    |
| getEvidenceTextAnalysis       | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSEvidenceRawWebPageData \| PSRefinedPolicyEvidence> | Analyzes the text for evidence and returns the analysis data.                                 |
| getEvidenceAIAnalysis         | subProblemIndex: number, policy: PSPolicy, type: PSEvidenceWebPageTypes, text: string | Promise<PSEvidenceRawWebPageData> | Gets the AI analysis of the evidence text.                                                    |
| mergeAnalysisData             | data1: PSEvidenceRawWebPageData, data2: PSEvidenceRawWebPageData | PSEvidenceRawWebPageData       | Merges two sets of analysis data into one.                                                    |
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a web page and saves the analysis data.                                  |
| getAndProcessEvidencePage     | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise<boolean> | Retrieves and processes an evidence web page.                                                  |
| processSubProblems            | browser: Browser | Promise<void> | Processes sub-problems by analyzing web pages for evidence.                                    |
| getAllPages                   | -                                                                      | Promise<void> | Retrieves and processes all pages for evidence.                                                |
| process                       | -                                                                      | Promise<void> | Main method to start the evidence web pages processing.                                        |

## Examples

```typescript
// Example usage of the GetEvidenceWebPagesProcessor class
const evidenceProcessor = new GetEvidenceWebPagesProcessor();
evidenceProcessor.process().then(() => {
  console.log(`Processed evidence from web pages. Total pages saved: ${evidenceProcessor.totalPagesSave}`);
});
```

Note: The provided TypeScript code is a part of a larger system and relies on several external classes and interfaces, such as `EvidenceWebPageVectorStore`, `ChatOpenAI`, and `PSEvidenceRawWebPageData`. The actual implementation details of these dependencies are not included in the documentation.