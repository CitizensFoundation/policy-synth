# RankWebEvidenceProcessor

This class extends `BaseProlemSolvingAgent` to rank web evidence related to policy proposals. It filters, deduplicates, and ranks web evidence based on its relevance and importance to a given policy proposal.

## Properties

| Name                        | Type                              | Description                                      |
|-----------------------------|-----------------------------------|--------------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore        | Stores and retrieves evidence web page vectors.  |

## Methods

| Name                 | Parameters                                                                                                      | Return Type | Description                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderProblemPrompt  | subProblemIndex: number \| null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise     | Prepares the problem prompt for the language model to filter and rank policy evidence.       |
| rankWebEvidence      | policy: PSPolicy, subProblemIndex: number                                                                        | Promise     | Ranks web evidence for a given policy by iterating over evidence types and updating rankings. |
| process              |                                                                                                                 | Promise     | Processes the ranking of web evidence across all sub-problems and policies.                   |

## Example

```typescript
// Example usage of RankWebEvidenceProcessor
import { RankWebEvidenceProcessor } from '@policysynth/agents/policies/ranking/rankWebEvidence.ts';

const rankWebEvidenceProcessor = new RankWebEvidenceProcessor();

// Assuming `policy` is an instance of PSPolicy and `subProblemIndex` is a number
rankWebEvidenceProcessor.rankWebEvidence(policy, subProblemIndex)
  .then(() => {
    console.log('Ranking of web evidence completed.');
  })
  .catch(error => {
    console.error('Error ranking web evidence:', error);
  });

// To process all sub-problems and policies
rankWebEvidenceProcessor.process()
  .then(() => {
    console.log('Finished ranking all web evidence.');
  })
  .catch(error => {
    console.error('Error processing web evidence ranking:', error);
  });
```