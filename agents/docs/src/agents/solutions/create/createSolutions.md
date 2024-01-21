# CreateSolutionsProcessor

The `CreateSolutionsProcessor` class is responsible for generating innovative solution components for sub-problems within a larger problem context. It leverages language models to create and refine solutions based on various contexts such as general, scientific, open data, and news.

## Properties

| Name                  | Type                          | Description                                                                 |
|-----------------------|-------------------------------|-----------------------------------------------------------------------------|
| webPageVectorStore    | WebPageVectorStore            | An instance of `WebPageVectorStore` used for vector-based search operations.|

## Methods

| Name                          | Parameters                                                                 | Return Type            | Description                                                                                   |
|-------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| renderRefinePrompt            | results: IEngineSolution[], generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined | Promise<any>           | Generates a prompt for refining previously generated solution components.                     |
| renderCreateSystemMessage     | -                                                                          | SystemMessage          | Creates a system message with instructions for generating innovative solution components.     |
| renderCreateForTestTokens     | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined      | any                    | Prepares a message for testing token limits in solution component creation.                   |
| renderCreatePrompt            | generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined | Promise<any>           | Generates a prompt for creating new solution components.                                     |
| createSolutions               | subProblemIndex: number, generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, alreadyCreatedSolutions: string \| undefined, stageName: IEngineStageTypes | Promise<IEngineSolution[]> | Creates solution components based on provided contexts and refines them if necessary.         |
| randomSearchQueryIndex        | searchQueries: IEngineSearchQueries, type: IEngineWebPageTypes             | number                  | Selects a random index for a search query based on the type.                                  |
| getAllTypeQueries             | searchQueries: IEngineSearchQueries, subProblemIndex: number \| undefined   | any                     | Retrieves all types of search queries for a given sub-problem.                                |
| getRandomSearchQueryForType   | type: IEngineWebPageTypes, problemStatementQueries: IEngineSearchQuery, subProblemQueries: IEngineSearchQuery, otherSubProblemQueries: IEngineSearchQuery, randomEntitySearchQueries: IEngineSearchQuery | string                  | Selects a random search query for a given type based on various problem contexts.             |
| getSearchQueries              | subProblemIndex: number                                                    | any                     | Retrieves search queries for a sub-problem.                                                   |
| getTextContext                | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined      | Promise<any>            | Gets the text context for a sub-problem based on search queries.                              |
| getWeightedRandomSolution     | array: T[]                                                                 | T \| ""                 | Selects a random solution from an array with weighted probabilities.                          |
| countTokensForString          | text: string                                                               | Promise<number>         | Counts the number of tokens in a given text string.                                           |
| getRandomItemFromArray        | array: T[], useTopN: number \| undefined                                   | T \| ""                 | Selects a random item from an array, optionally using only the top N items.                   |
| renderRawSearchResults        | rawSearchResults: IEngineWebPageGraphQlResults                             | any                     | Renders search results from raw data obtained from a vector search.                           |
| searchForType                 | subProblemIndex: number, type: IEngineWebPageTypes, searchQuery: string, tokensLeftForType: number | Promise<any>            | Performs a search for a given type and query, considering token limits.                       |
| getSearchQueryTextContext     | subProblemIndex: number, searchQuery: string, type: IEngineWebPageTypes, alreadyCreatedSolutions: string \| undefined | Promise<any>            | Retrieves the text context for a search query of a specific type.                             |
| createAllSeedSolutions        | -                                                                          | Promise<void>           | Creates all seed solutions for sub-problems.                                                  |
| process                       | -                                                                          | Promise<void>           | Main processing method that orchestrates the creation of seed solution components.            |

## Examples

```typescript
// Example usage of the CreateSolutionsProcessor class
const createSolutionsProcessor = new CreateSolutionsProcessor();
createSolutionsProcessor.process().then(() => {
  console.log('Seed solution components created successfully.');
}).catch(error => {
  console.error('Error creating seed solution components:', error);
});
```

Note: The actual implementation of the `CreateSolutionsProcessor` class includes additional private methods and properties that are not documented here. The example provided is a simplified usage scenario.