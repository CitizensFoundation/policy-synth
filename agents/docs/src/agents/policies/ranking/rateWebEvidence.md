# RateWebEvidenceProcessor

The `RateWebEvidenceProcessor` class extends the `BaseProcessor` and is responsible for rating web evidence related to policy proposals. It utilizes a vector store to retrieve and update web page data, and it interacts with a language model to generate ratings.

## Properties

| Name                           | Type                                      | Description                                                                 |
|--------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| evidenceWebPageVectorStore     | EvidenceWebPageVectorStore                | An instance of `EvidenceWebPageVectorStore` to manage web page vector data. |

## Methods

| Name                    | Parameters                                                                 | Return Type | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| simplifyEvidenceType    | evidenceType: string                                                       | string      | Simplifies the evidence type string by removing certain substrings.                           |
| renderProblemPrompt     | subProblemIndex: number \| null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the language model to generate ratings.                       |
| rateWebEvidence         | policy: PSPolicy, subProblemIndex: number                                  | Promise<void> | Rates web evidence for a given policy and sub-problem index.                                  |
| process                 | -                                                                          | Promise<void> | Orchestrates the process of rating web evidence for all sub-problems and policies.           |

## Examples

```typescript
// Example usage of the RateWebEvidenceProcessor class
const rateWebEvidenceProcessor = new RateWebEvidenceProcessor();

// Simplify an evidence type string
const simpleEvidenceType = rateWebEvidenceProcessor.simplifyEvidenceType('allPossibleIdentifiedInTextContextEvidence');

// Rate web evidence for a given policy and sub-problem index
await rateWebEvidenceProcessor.rateWebEvidence(somePolicy, someSubProblemIndex);

// Process all sub-problems and policies to rate web evidence
await rateWebEvidenceProcessor.process();
```

Please note that the actual implementation of `PSPolicy`, `PSEvidenceRawWebPageData`, `PSPolicyRating`, and `IEngineConstants` are not provided in the given code snippet, and thus their detailed descriptions are not included in this documentation.