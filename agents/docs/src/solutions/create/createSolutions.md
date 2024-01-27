# CreateSolutionsProcessor

This class extends `BaseProlemSolvingAgent` to create innovative solution components for problems and associated sub-problems. It utilizes various contexts (General, Scientific, Open Data, and News) to generate and refine solution components.

## Properties

| Name               | Type                        | Description                                           |
|--------------------|-----------------------------|-------------------------------------------------------|
| webPageVectorStore | WebPageVectorStore          | An instance of `WebPageVectorStore` for vector search.|

## Methods

| Name                        | Parameters                                                                                                   | Return Type                                      | Description                                                                                   |
|-----------------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------|
| renderRefinePrompt          | results: IEngineSolution[], generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined = undefined | Promise<SystemMessage[] \| HumanMessage[]>       | Generates messages for refining previously created solution components.                      |
| renderCreateSystemMessage   |                                                                                                              | SystemMessage                                    | Creates a system message with instructions for creating solution components.                 |
| renderCreateForTestTokens   | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined = undefined                            | SystemMessage[] \| HumanMessage[]                | Generates messages for creating solution components, used for testing token counts.          |
| renderCreatePrompt          | generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined = undefined | Promise<SystemMessage[] \| HumanMessage[]>       | Generates messages for creating new solution components based on various contexts.           |
| createSolutions             | subProblemIndex: number, generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, alreadyCreatedSolutions: string \| undefined = undefined, stageName: IEngineStageTypes = "create-seed-solutions" | Promise<IEngineSolution[]>                       | Creates solution components based on provided contexts and optionally refines them.          |
| randomSearchQueryIndex      | searchQueries: IEngineSearchQueries, type: IEngineWebPageTypes                                                | number                                           | Selects a random search query index based on the type.                                       |
| getAllTypeQueries           | searchQueries: IEngineSearchQueries, subProblemIndex: number \| undefined                                     | { general: string; scientific: string; openData: string; news: string; } | Retrieves all type queries for a sub-problem.                                                |
| getRandomSearchQueryForType | type: IEngineWebPageTypes, problemStatementQueries: IEngineSearchQuery, subProblemQueries: IEngineSearchQuery, otherSubProblemQueries: IEngineSearchQuery, randomEntitySearchQueries: IEngineSearchQuery | string                                           | Selects a random search query for a given type based on various probabilities.               |
| getSearchQueries            | subProblemIndex: number                                                                                       | { scientific: string; general: string; openData: string; news: string; } | Retrieves search queries for a sub-problem.                                                  |
| getTextContext              | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined = undefined                             | Promise<{ general: any; scientific: any; openData: any; news: any; }> | Retrieves text contexts for a sub-problem based on search queries.                           |
| getWeightedRandomSolution   | array: T[]                                                                                                    | string \| T                                      | Selects a random solution from an array based on predefined weights.                         |
| countTokensForString        | text: string                                                                                                  | Promise<number>                                  | Counts the number of tokens in a given text string.                                           |
| getRandomItemFromArray      | array: T[], useTopN: number \| undefined = undefined                                                           | string \| T                                      | Selects a random item from an array, optionally limiting to the top N items.                 |
| renderRawSearchResults      | rawSearchResults: IEngineWebPageGraphQlResults                                                                | { searchResults: string; selectedUrl: string; }  | Renders search results from raw search data, selecting relevant paragraphs and solutions.    |
| searchForType               | subProblemIndex: number, type: IEngineWebPageTypes, searchQuery: string, tokensLeftForType: number            | Promise<{ searchResults: string; selectedUrl: string; }> | Searches for relevant information of a given type using a search query.                      |
| getSearchQueryTextContext   | subProblemIndex: number, searchQuery: string, type: IEngineWebPageTypes, alreadyCreatedSolutions: string \| undefined = undefined | Promise<{ searchResults: string; selectedUrl: string; }> | Retrieves search query text context for a given type.                                        |
| createAllSeedSolutions      |                                                                                                              | Promise<void>                                    | Creates all seed solutions for the sub-problems defined in memory.                           |
| process                     |                                                                                                              | Promise<void>                                    | Main process method to initiate the creation of seed solution components.                    |

## Example

```javascript
// Example usage of CreateSolutionsProcessor
import { CreateSolutionsProcessor } from '@policysynth/agents/solutions/create/createSolutions.js';

const processor = new CreateSolutionsProcessor();
processor.process().then(() => {
  console.log('Seed solution components created successfully.');
}).catch(error => {
  console.error('Error creating seed solution components:', error);
});
```