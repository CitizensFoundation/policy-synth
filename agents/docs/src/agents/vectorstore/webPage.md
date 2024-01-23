# WebPageVectorStore

The `WebPageVectorStore` class extends `PolicySynthAgentBase` and provides methods to interact with a Weaviate instance for operations related to web pages, such as adding schemas, querying, creating, updating, and deleting web page data.

## Properties

| Name   | Type            | Description                                   |
|--------|-----------------|-----------------------------------------------|
| client | WeaviateClient  | Static Weaviate client instance.              |

## Methods

| Name                     | Parameters                                                                 | Return Type                         | Description                                                                 |
|--------------------------|----------------------------------------------------------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| addSchema                |                                                                            | Promise<void>                       | Reads a web page schema from a file and adds it to the Weaviate schema.     |
| showScheme               |                                                                            | Promise<void>                       | Retrieves and logs the current Weaviate schema.                              |
| deleteScheme             |                                                                            | Promise<void>                       | Deletes the "WebPage" class from the Weaviate schema.                        |
| testQuery                |                                                                            | Promise<any>                        | Performs a test query on the "WebPage" class with specific conditions.      |
| postWebPage              | webPageAnalysis: IEngineWebPageAnalysisData                                | Promise<any>                        | Saves a web page analysis to Weaviate.                                       |
| updateWebPage            | id: string, webPageAnalysis: IEngineWebPageAnalysisData                    | Promise<any>                        | Updates a web page analysis in Weaviate by ID.                               |
| updateWebSolutions       | id: string, webSolutions: string[], quiet: boolean                         | Promise<any>                        | Updates the solutions for a web page in Weaviate by ID.                      |
| getWebPage               | id: string                                                                 | Promise<IEngineWebPageAnalysisData> | Retrieves a web page analysis from Weaviate by ID.                           |
| getWebPagesForProcessing | groupId: number, subProblemIndex: number, entityIndex: number, searchType: IEngineSearchQueries, limit: number, offset: number, solutionCountLimit: number | Promise<IEngineWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria.                |
| webPageExist             | groupId: number, url: string, searchType: IEngineWebPageTypes, subProblemIndex: number, entityIndex: number | Promise<Boolean>                    | Checks if a web page exists in Weaviate based on various criteria.           |
| searchWebPages           | query: string, groupId: number, subProblemIndex: number, searchType: IEngineWebPageTypes, filterOutEmptySolutions: boolean | Promise<IEngineWebPageGraphQlResults> | Searches for web pages in Weaviate based on a query and various criteria.    |

## Examples

```typescript
// Example usage of adding a schema
const webPageVectorStore = new WebPageVectorStore();
await webPageVectorStore.addSchema();

// Example usage of posting a web page analysis
const webPageAnalysisData = {
  // ... web page analysis data
};
await webPageVectorStore.postWebPage(webPageAnalysisData);

// Example usage of updating web solutions for a web page
const webPageId = 'some-web-page-id';
const webSolutions = ['Solution 1', 'Solution 2'];
await webPageVectorStore.updateWebSolutions(webPageId, webSolutions);

// Example usage of checking if a web page exists
const groupId = 123;
const url = 'http://example.com';
const searchType = 'SomeSearchType';
const subProblemIndex = 1;
const entityIndex = 2;
const doesExist = await webPageVectorStore.webPageExist(groupId, url, searchType, subProblemIndex, entityIndex);
console.log(doesExist);
```

Note: The `IEngineWebPageAnalysisData`, `IEngineWebPageGraphQlSingleResult`, `IEngineWebPageGraphQlResults`, `IEngineSearchQueries`, and `IEngineWebPageTypes` types are not defined within the provided code and should be defined elsewhere in the project. The `IEngineConstants` is also referenced but not defined in the provided code.