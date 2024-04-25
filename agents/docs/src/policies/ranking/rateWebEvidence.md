# RateWebEvidenceProcessor

This class extends `BaseProblemSolvingAgent` to process and rate web evidence related to policy proposals. It utilizes a vector store for evidence web pages and interfaces with language models for generating ratings.

## Properties

| Name                        | Type                                  | Description                                      |
|-----------------------------|---------------------------------------|--------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore            | Store for evidence web page vectors.             |

## Methods

| Name                   | Parameters                                                                                                      | Return Type                  | Description                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| simplifyEvidenceType   | evidenceType: string                                                                                            | string                       | Simplifies the evidence type string by removing specific substrings.                          |
| renderProblemPrompt    | subProblemIndex: number \| null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the language model based on the policy and evidence details. |
| rateWebEvidence        | policy: PSPolicy, subProblemIndex: number                                                                       | Promise<void>               | Rates all web evidence for a given policy and sub-problem index.                              |
| process                | -                                                                                                               | Promise<void>               | Processes and rates web evidence for all sub-problems and policies.                           |

## Example

```typescript
// Example usage of RateWebEvidenceProcessor
import { RateWebEvidenceProcessor } from '@policysynth/agents/policies/ranking/rateWebEvidence.js';

const rateWebEvidenceProcessor = new RateWebEvidenceProcessor();

// Assuming necessary setup and context are provided
async function run() {
  await rateWebEvidenceProcessor.process();
}

run().catch(console.error);
```