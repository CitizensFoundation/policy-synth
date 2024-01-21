# WebPageVectorStore

The `WebPageVectorStore` class is responsible for interacting with a Weaviate instance to perform operations related to web page vectors, such as creating and updating schemas, querying, and managing web page data.

## Properties

| Name   | Type            | Description                                   |
|--------|-----------------|-----------------------------------------------|
| client | WeaviateClient  | Static Weaviate client instance.              |

## Methods

| Name                      | Parameters                                                                 | Return Type                             | Description                                                                                   |
|---------------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| addSchema                 |                                                                            | Promise<void>                           | Reads a schema from a file and adds it to the Weaviate instance.                               |
| showScheme                |                                                                            | Promise<void>                           | Retrieves and logs the current schema from the Weaviate instance.                              |
| deleteScheme              |                                                                            | Promise<void>                           | Deletes the 'WebPage' class from the Weaviate schema.                                          |
| testQuery                 |                                                                            | Promise<any>                            | Performs a test query on the Weaviate instance and logs the results.                           |
| postWebPage               | webPageAnalysis: IEngineWebPageAnalysisData                                | Promise<any>                            | Saves a web page analysis to the Weaviate instance.                                            |
| updateWebPage             | id: string, webPageAnalysis: IEngineWebPageAnalysisData                    | Promise<any>                            | Updates a web page analysis in the Weaviate instance.                                          |
| updateWebSolutions        | id: string, webSolutions: string[], quiet: boolean                         | Promise<any>                            | Updates the solutions for a web page in the Weaviate instance.                                 |
| getWebPage                | id: string                                                                 | Promise<IEngineWebPageAnalysisData>     | Retrieves a web page analysis from the Weaviate instance.                                      |
| getWebPagesForProcessing  | groupId: number, subProblemIndex: number \| undefined \| null, entityIndex: number \| undefined \| null, searchType: IEngineSearchQueries \| undefined, limit: number, offset: number, solutionCountLimit: number \| undefined | Promise<IEngineWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria.                                  |
| webPageExist              | groupId: number, url: string, searchType: IEngineWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise<Boolean>                       | Checks if a web page exists in the Weaviate instance based on various criteria.                |
| searchWebPages            | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: IEngineWebPageTypes \| undefined, filterOutEmptySolutions: boolean | Promise<IEngineWebPageGraphQlResults> | Searches for web pages in the Weaviate instance based on a query and various criteria.         |

## Examples

```typescript
// Example usage of the WebPageVectorStore class
const webPageVectorStore = new WebPageVectorStore();

// Adding a schema to the Weaviate instance
await webPageVectorStore.addSchema();

// Showing the current schema
await webPageVectorStore.showScheme();

// Deleting the 'WebPage' class from the schema
await webPageVectorStore.deleteScheme();

// Posting a web page analysis
const webPageAnalysis = {
  // ... web page analysis data
};
await webPageVectorStore.postWebPage(webPageAnalysis);

// Updating a web page analysis
const webPageId = "some-web-page-id";
await webPageVectorStore.updateWebPage(webPageId, webPageAnalysis);

// Getting a web page analysis
const retrievedWebPageAnalysis = await webPageVectorStore.getWebPage(webPageId);

// Searching for web pages
const searchResults = await webPageVectorStore.searchWebPages("democracy", undefined, undefined, undefined, true);
```

Note: The `IEngineWebPageAnalysisData`, `IEngineWebPageGraphQlResults`, `IEngineSearchQueries`, and `IEngineWebPageTypes` types are not defined in the provided code snippet and should be defined elsewhere in the project.