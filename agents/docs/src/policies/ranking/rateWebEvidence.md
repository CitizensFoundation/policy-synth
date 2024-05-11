# RateWebEvidenceProcessor

This class extends `BaseProblemSolvingAgent` to process and rate web evidence related to policy proposals. It utilizes vector stores for managing web page data and interfaces with a language model to generate ratings.

## Properties

| Name                        | Type                             | Description                                       |
|-----------------------------|----------------------------------|---------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore       | Store for managing evidence web page vectors.     |

## Methods

| Name                   | Parameters                                                                                                    | Return Type | Description                                                                 |
|------------------------|---------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| simplifyEvidenceType   | evidenceType: string                                                                                          | string      | Simplifies the evidence type by removing specific substrings.                |
| renderProblemPrompt    | subProblemIndex: number \| null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the language model based on the evidence.    |
| rateWebEvidence        | policy: PSPolicy, subProblemIndex: number                                                                     | Promise<void> | Rates all web evidence for a given policy and sub-problem index.             |
| process                | -                                                                                                             | Promise<void> | Processes the rating of web evidence across all sub-problems and policies.  |

## Example

```typescript
// Example usage of RateWebEvidenceProcessor
import { RateWebEvidenceProcessor } from '@policysynth/agents/policies/ranking/rateWebEvidence.js';

const processor = new RateWebEvidenceProcessor();

// Example method calls
processor.process().then(() => {
  console.log("Finished processing all web evidence.");
}).catch(error => {
  console.error("Error processing web evidence:", error);
});
```