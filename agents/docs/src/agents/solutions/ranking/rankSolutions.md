# RankSolutionsProcessor

The `RankSolutionsProcessor` class extends the `BasePairwiseRankingsProcessor` to rank solution components for sub-problems by voting on pairs of solutions.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for communication with OpenAI's language model. |

## Methods

| Name                | Parameters                  | Return Type                  | Description                                                                 |
|---------------------|-----------------------------|------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair    | subProblemIndex: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Votes on a pair of prompts to determine which solution component is more important and practical. |
| processSubProblem   | subProblemIndex: number     | Promise<void>                | Processes a sub-problem by ranking its solution components.                 |
| process             | None                        | Promise<void>                | Processes all sub-problems to rank their solution components.               |

## Examples

```typescript
// Example usage of RankSolutionsProcessor
const rankSolutionsProcessor = new RankSolutionsProcessor();

// To vote on a prompt pair
rankSolutionsProcessor.voteOnPromptPair(0, [1, 2]).then((voteResults) => {
  console.log(voteResults);
});

// To process a sub-problem
rankSolutionsProcessor.processSubProblem(0).then(() => {
  console.log('Sub-problem processed');
});

// To process all sub-problems
rankSolutionsProcessor.process().then(() => {
  console.log('All sub-problems processed');
});
```