# CreateSolutionsProcessor

This class is responsible for creating and refining solution components for specific sub-problems using various text contexts. It extends the `BaseProblemSolvingAgent` class and utilizes methods to interact with language models and vector stores for generating innovative solutions.

## Properties

| Name               | Type                  | Description                                      |
|--------------------|-----------------------|--------------------------------------------------|
| webPageVectorStore | WebPageVectorStore    | An instance of WebPageVectorStore for handling vector-based web page searches. |

## Methods

| Name                        | Parameters                                                                                                      | Return Type                  | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderRefinePrompt          | results: IEngineSolution[], generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined | Promise<SystemMessage[]>     | Generates messages for refining previously created solution components based on various contexts. |
| renderCreateSystemMessage   | -                                                                                                               | SystemMessage                | Creates a system message with instructions for creating new solution components. |
| renderCreateForTestTokens   | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined                                           | SystemMessage[]              | Prepares messages for testing token limits in solution creation prompts. |
| renderCreatePrompt          | generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, subProblemIndex: number, alreadyCreatedSolutions: string \| undefined | Promise<SystemMessage[]>     | Generates messages for creating new solution components based on various contexts. |
| createSolutions             | subProblemIndex: number, generalTextContext: string, scientificTextContext: string, openDataTextContext: string, newsTextContext: string, alreadyCreatedSolutions: string \| undefined, stageName: PsMemoryStageTypes | Promise<IEngineSolution[]>   | Main method for generating new solution components using language models. |
| randomSearchQueryIndex      | searchQueries: IEngineSearchQueries, type: IEngineWebPageTypes                                                   | number                       | Selects a random index for a search query based on the type. |
| getAllTypeQueries           | searchQueries: IEngineSearchQueries, subProblemIndex: number \| undefined                                        | { [key: string]: string }    | Retrieves all types of search queries for a given sub-problem. |
| getRandomSearchQueryForType | type: IEngineWebPageTypes, problemStatementQueries: IEngineSearchQuery, subProblemQueries: IEngineSearchQuery, otherSubProblemQueries: IEngineSearchQuery, randomEntitySearchQueries: IEngineSearchQuery | string                       | Determines a search query for a specific type based on various probabilities. |
| getSearchQueries            | subProblemIndex: number                                                                                         | { [key: string]: string }    | Compiles search queries from different sources for a sub-problem. |
| getTextContext              | subProblemIndex: number, alreadyCreatedSolutions: string \| undefined                                            | Promise<{ [key: string]: { searchResults: string, selectedUrl: string } }> | Retrieves text contexts for all types based on search queries. |
| getWeightedRandomSolution   | array: T[]                                                                                                      | T \| ""                      | Selects a random solution from an array with weighted probabilities. |
| countTokensForString        | text: string                                                                                                    | Promise<number>              | Counts the number of tokens in a given text. |
| getRandomItemFromArray      | array: T[], useTopN: number \| undefined                                                                        | T \| ""                      | Selects a random item from an array, optionally using only the top N items. |
| renderRawSearchResults      | rawSearchResults: IEngineWebPageGraphQlResults                                                                  | { searchResults: string, selectedUrl: string } | Processes raw search results to extract relevant information. |
| searchForType               | subProblemIndex: number, type: IEngineWebPageTypes, searchQuery: string, tokensLeftForType: number              | Promise<{ searchResults: string, selectedUrl: string }> | Performs a search for a specific type and handles token limits. |
| getSearchQueryTextContext   | subProblemIndex: number, searchQuery: string, type: IEngineWebPageTypes, alreadyCreatedSolutions: string \| undefined | Promise<{ searchResults: string, selectedUrl: string }> | Retrieves the text context for a specific type based on a search query. |
| createAllSeedSolutions      | -                                                                                                               | Promise<void>                | Initiates the creation of seed solutions for all sub-problems. |
| process                     | -                                                                                                               | void                         | Main processing method to handle the creation of seed solution components. |

## Example

```typescript
// Example usage of CreateSolutionsProcessor
import { CreateSolutionsProcessor } from '@policysynth/agents/solutions/create/createSolutions.js';

const processor = new CreateSolutionsProcessor();
processor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```