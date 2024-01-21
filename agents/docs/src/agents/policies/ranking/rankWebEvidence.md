# RankWebEvidenceProcessor

The `RankWebEvidenceProcessor` class extends the `BaseProcessor` and is responsible for ranking web evidence related to policy proposals. It filters irrelevant and duplicate evidence, ranks the evidence by importance, and updates the evidence store with the ranked evidence.

## Properties

| Name                          | Type                                  | Description                                                                 |
|-------------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| evidenceWebPageVectorStore    | EvidenceWebPageVectorStore            | An instance of `EvidenceWebPageVectorStore` to handle evidence storage.     |

## Methods

| Name                  | Parameters                                      | Return Type | Description                                                                                   |
|-----------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderProblemPrompt   | subProblemIndex: number \| null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Generates the prompt for the language model to filter and rank policy evidence.               |
| rankWebEvidence       | policy: PSPolicy, subProblemIndex: number       | Promise<void> | Ranks web evidence for a given policy and updates the evidence store with the ranked evidence. |
| process               | -                                               | Promise<void> | Orchestrates the process of ranking web evidence for all sub-problems and policies.           |

## Examples

```typescript
// Example usage of the RankWebEvidenceProcessor
const rankWebEvidenceProcessor = new RankWebEvidenceProcessor();

// Example of calling rankWebEvidence method
await rankWebEvidenceProcessor.rankWebEvidence(policy, subProblemIndex);

// Example of calling process method
await rankWebEvidenceProcessor.process();
```

Please note that the `PSPolicy`, `PSEvidenceRawWebPageData`, and other related types are not defined in the provided code snippet. They should be defined elsewhere in the codebase.