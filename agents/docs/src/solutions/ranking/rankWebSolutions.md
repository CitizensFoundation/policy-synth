# RankWebSolutionsProcessor

This class extends `BaseProblemSolvingAgent` to rank web solutions based on their relevance and importance to a given problem. It filters out irrelevant, inactionable, and duplicate solutions, and ranks the remaining ones.

## Properties

| Name                | Type                        | Description                                   |
|---------------------|-----------------------------|-----------------------------------------------|
| webPageVectorStore  | WebPageVectorStore          | Store for managing web page vectors.          |
| allUrls             | Set<string>                 | Set to track all URLs processed.              |
| duplicateUrls       | string[]                    | Array to store URLs identified as duplicates. |

## Methods

| Name                | Parameters                                  | Return Type       | Description                                                                 |
|---------------------|---------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| renderProblemPrompt | solutionsToRank: string[], subProblemIndex: number \| null | Promise<SystemMessage[] \| HumanMessage[]> | Generates the problem prompt for the LLM to process solutions.               |
| rankWebSolutions    | subProblemIndex: number                     | Promise<void>     | Processes and ranks web solutions for a specific sub-problem index.         |
| process             | -                                           | Promise<void>     | Orchestrates the ranking of web solutions across all sub-problems.          |

## Example

```typescript
// Example usage of RankWebSolutionsProcessor
import { RankWebSolutionsProcessor } from '@policysynth/agents/solutions/ranking/rankWebSolutions.js';

const processor = new RankWebSolutionsProcessor();

async function runRanking() {
  try {
    await processor.process();
    console.log("Ranking completed successfully.");
  } catch (error) {
    console.error("Error during ranking:", error);
  }
}

runRanking();
```