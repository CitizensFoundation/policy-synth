# RankWebEvidenceProcessor

This class extends `BaseProlemSolvingAgent` to rank web evidence related to policy proposals. It utilizes a vector store to retrieve and update web pages with ranked evidence.

## Properties

| Name                        | Type                             | Description                                   |
|-----------------------------|----------------------------------|-----------------------------------------------|
| evidenceWebPageVectorStore  | EvidenceWebPageVectorStore       | Store for evidence web page vectors.          |

## Methods

| Name                 | Parameters                                                                                                      | Return Type | Description                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderProblemPrompt  | subProblemIndex: number \| null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise     | Prepares the problem prompt for the language model to filter and rank policy evidence.       |
| rankWebEvidence      | policy: PSPolicy, subProblemIndex: number                                                                       | Promise     | Ranks all web evidence for a given policy by iterating over evidence types and updating the vector store with ranked evidence. |
| process              | -                                                                                                               | Promise     | Processes the ranking of web evidence across all sub-problems and policies.                   |

## Example

```javascript
// Example usage of RankWebEvidenceProcessor
import { RankWebEvidenceProcessor } from '@policysynth/agents/policies/ranking/rankWebEvidence.js';

const rankWebEvidenceProcessor = new RankWebEvidenceProcessor();

// Assuming necessary setup and context are provided
async function rankEvidence() {
  try {
    await rankWebEvidenceProcessor.process();
    console.log("Finished ranking all web evidence.");
  } catch (error) {
    console.error("Error ranking web evidence:", error);
  }
}

rankEvidence();
```