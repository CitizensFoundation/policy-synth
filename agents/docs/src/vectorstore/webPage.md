# WebPageVectorStore

This class is responsible for managing web page data using the Weaviate vector database. It extends the `PolicySynthAgentBase` class and provides methods to manipulate the schema and data of web pages in the vector database.

## Properties

| Name   | Type            | Description               |
|--------|-----------------|---------------------------|
| client | WeaviateClient  | Static Weaviate client instance initialized with environment configurations. |

## Methods

| Name                      | Parameters                                                                 | Return Type                         | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| addSchema                 |                                                                            | Promise<void>                       | Reads the web page schema from a file and adds it to the Weaviate schema.   |
| showScheme                |                                                                            | Promise<void>                       | Retrieves and logs the current schema from Weaviate.                        |
| deleteScheme              |                                                                            | Promise<void>                       | Deletes the 'WebPage' class from the Weaviate schema.                       |
| testQuery                 |                                                                            | Promise<any>                        | Executes a test query to fetch web pages with certain criteria.             |
| postWebPage               | webPageAnalysis: IEngineWebPageAnalysisData                                | Promise<any>                        | Posts a web page analysis to Weaviate.                                      |
| updateWebPage             | id: string, webPageAnalysis: IEngineWebPageAnalysisData                    | Promise<any>                        | Updates a web page analysis in Weaviate by ID.                              |
| deleteWebSolution         | id: string, quiet: boolean = false                                         | Promise<void>                       | Deletes a web solution from Weaviate by ID, optionally logs the action.     |
| updateWebSolutions        | id: string, webSolutions: string[], quiet: boolean = false                 | Promise<any>                        | Updates web solutions for a specific web page in Weaviate.                  |
| getWebPage                | id: string                                                                 | Promise<IEngineWebPageAnalysisData> | Retrieves a web page by ID from Weaviate.                                   |
| getWebPagesForProcessing  | groupId: number, subProblemIndex?: number, entityIndex?: number, searchType?: IEngineSearchQueries, limit: number = 10, offset: number = 0, solutionCountLimit?: number | Promise<IEngineWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria.               |
| webPageExist              | groupId: number, url: string, searchType: IEngineWebPageTypes, subProblemIndex?: number, entityIndex?: number | Promise<Boolean>                    | Checks if a web page exists in Weaviate based on provided criteria.         |
| searchWebPages            | query: string, groupId?: number, subProblemIndex?: number, searchType?: IEngineWebPageTypes, filterOutEmptySolutions: boolean = true | Promise<IEngineWebPageGraphQlResults> | Searches web pages in Weaviate based on a text query and other criteria.    |

## Example

```typescript
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/webPage.js';

const webPageStore = new WebPageVectorStore();

// Example usage to add schema
webPageStore.addSchema().then(() => {
  console.log('Schema added successfully');
}).catch(err => {
  console.error('Failed to add schema:', err);
});

// Example usage to post a web page
const webPageData = {
  url: "http://example.com",
  summary: "Example summary",
  // other necessary properties...
};
webPageStore.postWebPage(webPageData).then(response => {
  console.log('Web page posted:', response);
}).catch(err => {
  console.error('Failed to post web page:', err);
});
```