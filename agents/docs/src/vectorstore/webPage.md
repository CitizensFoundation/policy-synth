# WebPageVectorStore

This class is responsible for managing web page vectors, including adding, updating, deleting, and querying web page data using the Weaviate client.

## Properties

| Name    | Type            | Description |
|---------|-----------------|-------------|
| client  | WeaviateClient  | Static Weaviate client initialized with connection details from environment variables. |

## Methods

| Name                    | Parameters                                                                                      | Return Type                             | Description                                                                                   |
|-------------------------|-------------------------------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| addSchema               |                                                                                                 | Promise<void>                           | Reads a web page schema from a file and adds it to the Weaviate schema.                       |
| showScheme              |                                                                                                 | Promise<void>                           | Retrieves and logs the current schema from Weaviate.                                          |
| deleteScheme            |                                                                                                 | Promise<void>                           | Deletes the "WebPage" class from the Weaviate schema.                                         |
| testQuery               |                                                                                                 | Promise<any>                            | Executes a test query to retrieve web pages with solutions identified in text context.        |
| postWebPage             | webPageAnalysis: IEngineWebPageAnalysisData                                                     | Promise<any>                            | Saves a web page analysis to Weaviate.                                                        |
| updateWebPage           | id: string, webPageAnalysis: IEngineWebPageAnalysisData                                         | Promise<any>                            | Updates a web page analysis in Weaviate by ID.                                                |
| updateWebSolutions      | id: string, webSolutions: string[], quiet: boolean = false                                      | Promise<any>                            | Updates the solutions identified in text context for a web page in Weaviate by ID.            |
| getWebPage              | id: string                                                                                      | Promise<IEngineWebPageAnalysisData>    | Retrieves a web page analysis from Weaviate by ID.                                            |
| getWebPagesForProcessing| groupId: number, subProblemIndex: number \| undefined \| null, entityIndex: number \| undefined \| null, searchType: IEngineSearchQueries \| undefined, limit: number, offset: number, solutionCountLimit: number \| undefined | Promise<IEngineWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria.                                 |
| webPageExist            | groupId: number, url: string, searchType: IEngineWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise<Boolean>                      | Checks if a web page exists in Weaviate based on various criteria.                            |
| searchWebPages          | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: IEngineWebPageTypes \| undefined, filterOutEmptySolutions: boolean | Promise<IEngineWebPageGraphQlResults> | Searches for web pages in Weaviate based on a query and various criteria, with optional retries for failed attempts. |

## Example

```javascript
// Example usage of WebPageVectorStore
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/webPage.js';

const webPageStore = new WebPageVectorStore();

// Adding a schema
await webPageStore.addSchema();

// Posting a web page analysis
const webPageAnalysis = {
  url: "http://example.com",
  summary: "Example summary",
  // other properties...
};
await webPageStore.postWebPage(webPageAnalysis);

// Updating a web page analysis
await webPageStore.updateWebPage("webPageId", webPageAnalysis);

// Getting a web page analysis
const webPageData = await webPageStore.getWebPage("webPageId");
console.log(webPageData);

// Searching web pages
const searchResults = await webPageStore.searchWebPages("democracy", undefined, undefined, undefined, true);
console.log(searchResults);
```