# RootCauseWebPageVectorStore

This class is responsible for managing the storage and retrieval of web page vectors related to root causes in a Weaviate vector database. It extends the `PolicySynthAgentBase` class, providing methods to interact with the Weaviate schema, perform CRUD operations on web page data, and query the database for web pages based on various criteria.

## Properties

| Name             | Type   | Description |
|------------------|--------|-------------|
| fieldsToExtract  | string | A string containing the fields to extract from the Weaviate database. |
| client           | WeaviateClient | A Weaviate client instance for interacting with the Weaviate database. |

## Methods

| Name                        | Parameters                                                                 | Return Type                                  | Description |
|-----------------------------|----------------------------------------------------------------------------|----------------------------------------------|-------------|
| addSchema                   |                                                                            | Promise<void>                                | Adds a new schema to the Weaviate database based on a JSON file. |
| showScheme                  |                                                                            | Promise<void>                                | Retrieves and logs the current schema from the Weaviate database. |
| deleteScheme                |                                                                            | Promise<void>                                | Deletes the schema for the "RootCauseWebPage" class from the Weaviate database. |
| testQuery                   |                                                                            | Promise<any>                                 | Performs a test query on the Weaviate database and logs the results. |
| postWebPage                 | webPageAnalysis: PSRootCauseRawWebPageData                                 | Promise<any>                                 | Posts a new web page analysis to the Weaviate database. |
| updateWebPage               | id: string, webPageAnalysis: PSRootCauseRawWebPageData                     | Promise<any>                                 | Updates an existing web page analysis in the Weaviate database. |
| updateWebRootCause          | id: string, rootCauseType: string, rootCauses: string[], quiet: boolean    | Promise<any>                                 | Updates the root causes for a web page in the Weaviate database. |
| saveWebPageMetadata         | id: string, metadata: PSWebPageMetadata, quiet: boolean                    | Promise<any>                                 | Saves metadata for a web page in the Weaviate database. |
| updateRefinedAnalysis       | id: string, refinedRootCause: PSRefinedRootCause, quiet: boolean           | Promise<any>                                 | Updates the refined analysis for a web page in the Weaviate database. |
| updateScores                | id: string, scores: PSRootCauseRating, quiet: boolean                      | Promise<any>                                 | Updates the scores for a web page in the Weaviate database. |
| getWebPage                  | id: string                                                                  | Promise<PSRootCauseRawWebPageData>           | Retrieves a web page analysis from the Weaviate database. |
| getTopPagesForProcessing    | groupId: number, searchType: string \| undefined, limit: number             | Promise<PSRootCauseWebPageGraphQlResults>    | Retrieves the top pages for processing based on the total score. |
| getTopWebPagesForProcessing | groupId: number, searchType: string \| undefined, limit: number, offset: number, rootCauseCountLimit: number \| undefined, onlyRefined: boolean | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves the top web pages for processing with additional filtering options. |
| getWebPagesForProcessing    | groupId: number, searchType: string \| undefined, limit: number, offset: number, rootCauseCountLimit: number \| undefined | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves web pages for processing with filtering options. |
| webPageExist                | groupId: number, url: string, searchType: PSRootCauseWebPageTypes           | Promise<Boolean>                             | Checks if a web page exists in the Weaviate database. |
| searchWebPages              | query: string, groupId: number \| undefined, searchType: PSRootCauseWebPageTypes \| undefined | Promise<PSRootCauseWebPageGraphQlResults> | Searches for web pages in the Weaviate database based on a query and optional filters. |

## Example

```javascript
import { RootCauseWebPageVectorStore } from '@policysynth/agents/vectorstore/rootCauseWebPage.js';

const vectorStore = new RootCauseWebPageVectorStore();

// Example usage to add a schema
vectorStore.addSchema().then(() => {
  console.log('Schema added successfully.');
}).catch((err) => {
  console.error('Error adding schema:', err);
});

// Example usage to post a new web page analysis
const webPageAnalysis = {
  url: 'https://example.com',
  rootCauseRelevanceToProblemStatement: 'High',
  // other properties...
};
vectorStore.postWebPage(webPageAnalysis).then((res) => {
  console.log('Web page posted successfully:', res);
}).catch((err) => {
  console.error('Error posting web page:', err);
});
```