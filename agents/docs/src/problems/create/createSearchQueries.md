# CreateSearchQueriesProcessor

This class extends `BaseProblemSolvingAgent` to generate search queries based on problem statements and affected entities. It utilizes a methodical approach to create concise and consistent search queries for different categories such as General, Scientific, OpenData, and News.

## Properties

No public properties are documented for this class.

## Methods

| Name                    | Parameters                                      | Return Type            | Description                                                                 |
|-------------------------|-------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderCommonPromptSection | None                                            | string                 | Generates a common prompt section for search query creation guidelines.     |
| renderProblemPrompt     | problem: string                                 | Promise<SystemMessage[]> | Generates prompts for creating search queries based on a problem statement. |
| renderEntityPrompt      | problem: string, entity: IEngineAffectedEntity  | Promise<SystemMessage[]> | Generates prompts for creating search queries focused on an affected entity.|
| process                 | None                                            | Promise<void>          | Processes the creation of search queries for problem statements and entities. |

## Example

```typescript
import { CreateSearchQueriesProcessor } from '@policysynth/agents/problems/create/createSearchQueries.js';

const processor = new CreateSearchQueriesProcessor();

// Example usage to process search queries
processor.process().then(() => {
  console.log("Search queries processing completed.");
}).catch(error => {
  console.error("Error processing search queries:", error);
});
```