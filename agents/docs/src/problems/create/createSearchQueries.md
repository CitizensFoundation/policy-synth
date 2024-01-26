# CreateSearchQueriesProcessor

This class extends BaseProlemSolvingAgent to create search queries based on problem statements and affected entities. It generates high-quality search queries for different categories such as General, Scientific, OpenData, and News.

## Methods

| Name                    | Parameters                                      | Return Type | Description                                                                                   |
|-------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderCommonPromptSection | None                                            | string      | Returns a common prompt section for generating search queries.                                |
| renderProblemPrompt     | problem: string                                 | Promise     | Generates a prompt for creating search queries based on a problem statement.                 |
| renderEntityPrompt      | problem: string, entity: IEngineAffectedEntity | Promise     | Generates a prompt for creating search queries based on an affected entity.                   |
| process                 | None                                            | Promise<void> | Processes the generation of search queries for the main problem and its subproblems. |

## Example

```javascript
import { CreateSearchQueriesProcessor } from '@policysynth/agents/problems/create/createSearchQueries.js';

const createSearchQueriesProcessor = new CreateSearchQueriesProcessor();

// Example usage for generating search queries based on a problem statement
const problemStatement = "How to reduce carbon footprint in urban areas?";
createSearchQueriesProcessor.renderProblemPrompt(problemStatement).then((prompt) => {
  console.log(prompt);
});

// Example usage for generating search queries for an affected entity
const affectedEntity = {
  name: "Urban Transportation",
  // Additional properties of the entity...
};
const problem = "Exploring sustainable urban transportation options";
createSearchQueriesProcessor.renderEntityPrompt(problem, affectedEntity).then((prompt) => {
  console.log(prompt);
});

// Processing to generate search queries for the main problem and subproblems
createSearchQueriesProcessor.process().then(() => {
  console.log("Finished creating search queries.");
});
```