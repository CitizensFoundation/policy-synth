# RankWebEvidenceProcessor

This class extends `BaseProblemSolvingAgent` to rank web evidence related to policy proposals.

## Properties

| Name                        | Type                             | Description                                       |
|-----------------------------|----------------------------------|---------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore       | Store for managing vectors of web page evidence.  |

## Methods

| Name                | Parameters                                                                                      | Return Type | Description                                                                 |
|---------------------|-------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderProblemPrompt | subProblemIndex: number \| null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the language model based on the evidence.  |
| rankWebEvidence     | policy: PSPolicy, subProblemIndex: number                                                       | Promise<void> | Ranks the web evidence for a given policy and sub-problem index.            |
| process             | -                                                                                               | Promise<void> | Processes the ranking of web evidence across sub-problems and policies.    |

## Example

```typescript
// Example usage of RankWebEvidenceProcessor
import { RankWebEvidenceProcessor } from '@policysynth/agents/policies/ranking/rankWebEvidence.js';

const rankProcessor = new RankWebEvidenceProcessor();

// Example of setting up and using the rankWebEvidence method
const policy = {
  title: "Example Policy",
  description: "A policy to demonstrate evidence ranking."
};
const subProblemIndex = 0;

rankProcessor.rankWebEvidence(policy, subProblemIndex)
  .then(() => console.log("Ranking completed"))
  .catch(error => console.error("Error during ranking:", error));

// Example of processing all sub-problems and policies
rankProcessor.process()
  .then(() => console.log("All web evidence ranked"))
  .catch(error => console.error("Error during processing:", error));
```