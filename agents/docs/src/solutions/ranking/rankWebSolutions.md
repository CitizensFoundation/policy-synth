# RankWebSolutionsProcessor

This class extends `BaseProlemSolvingAgent` to rank web solutions based on their relevance and importance to a given problem. It utilizes a vector store for web pages and an AI model for ranking.

## Properties

| Name               | Type                        | Description                                   |
|--------------------|-----------------------------|-----------------------------------------------|
| webPageVectorStore | WebPageVectorStore          | A store for web page vectors.                 |

## Methods

| Name                  | Parameters                                  | Return Type                  | Description                                                                 |
|-----------------------|---------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderProblemPrompt   | solutionsToRank: string[], subProblemIndex: number \| null | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the AI model based on the solutions to rank. |
| rankWebSolutions      | subProblemIndex: number                     | Promise<void>                | Ranks web solutions for a given sub-problem index.                          |
| process               | -                                           | Promise<void>                | Processes the ranking of web solutions for all sub-problems.                |

## Example

```typescript
// Example usage of RankWebSolutionsProcessor
import { RankWebSolutionsProcessor } from '@policysynth/agents/solutions/ranking/rankWebSolutions.js';

async function rankSolutions() {
  const processor = new RankWebSolutionsProcessor();
  await processor.process();
}

rankSolutions().then(() => console.log('Finished ranking web solutions.'));
```