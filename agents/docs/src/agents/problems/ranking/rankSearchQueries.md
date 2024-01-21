# RankSearchQueriesProcessor

The `RankSearchQueriesProcessor` class is responsible for ranking search queries based on their relevance to complex problem statements, sub-problems, and affected entities. It extends the `BasePairwiseRankingsProcessor` class.

## Properties

No properties are explicitly defined in the provided code snippet.

## Methods

| Name                  | Parameters                                                                 | Return Type                         | Description                                                                                   |
|-----------------------|----------------------------------------------------------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------|
| renderProblemDetail   | additionalData: { subProblemIndex: number, currentEntity?: IEngineAffectedEntity; searchQueryType?: IEngineWebPageTypes; searchQueryTarget: "problemStatement" \| "subProblem" \| "entity"; } | string                             | Renders the problem detail based on the provided additional data.                              |
| voteOnPromptPair      | index: number, promptPair: number[], additionalData: { currentEntity?: IEngineAffectedEntity; searchQueryType?: IEngineWebPageTypes; subProblemIndex: number; searchQueryTarget: "problemStatement" \| "subProblem" \| "entity"; } | Promise<IEnginePairWiseVoteResults> | Votes on a pair of prompts to determine the most relevant search query.                       |
| processSubProblems    | -                                                                          | Promise<void>                      | Processes sub-problems to rank their search queries.                                          |
| getQueryIndex         | searchQueryType: IEngineWebPageTypes                                       | number                             | Gets the index for a given search query type.                                                 |
| processEntities       | subProblemIndex: number                                                    | Promise<void>                      | Processes entities for a given sub-problem to rank their search queries.                      |
| process               | -                                                                          | Promise<void>                      | Main method to process the ranking of search queries for problem statements and sub-problems. |

## Examples

```typescript
// Example usage of the RankSearchQueriesProcessor class
const rankSearchQueriesProcessor = new RankSearchQueriesProcessor();

// Example of processing sub-problems
await rankSearchQueriesProcessor.processSubProblems();

// Example of processing entities for a specific sub-problem
await rankSearchQueriesProcessor.processEntities(0);

// Example of processing the entire ranking task
await rankSearchQueriesProcessor.process();
```

Note: The actual usage of the `RankSearchQueriesProcessor` class would depend on the context in which it is used, including the initialization of the class with the necessary dependencies and data. The examples provided here are for illustrative purposes and may require additional setup not shown in the code snippet.