# BaseVectorStoreClient

This class provides an abstract base for interacting with a vector store using the Weaviate client. It extends the `PolicySynthScAgentBase` class and includes methods for managing schemas, querying, and manipulating data related to web pages.

## Properties

| Name   | Type           | Description |
|--------|----------------|-------------|
| client | WeaviateClient | Static Weaviate client initialized with environment variables or default values. |

## Methods

| Name                     | Parameters                                             | Return Type                         | Description |
|--------------------------|--------------------------------------------------------|-------------------------------------|-------------|
| addSchema                |                                                        | Promise<void>                       | Reads a schema from a file and adds it to the Weaviate schema. |
| showScheme               |                                                        | Promise<void>                       | Retrieves and logs the current schema from Weaviate. |
| deleteScheme             |                                                        | Promise<void>                       | Deletes the 'WebPage' class from the Weaviate schema. |
| testQuery                |                                                        | Promise<any>                        | Performs a test query to retrieve web pages with specific criteria. |
| postWebPage              | webPageAnalysis: PsWebPageAnalysisData            | Promise<any>                        | Posts a web page analysis to Weaviate. |
| updateWebPage            | id: string, webPageAnalysis: PsWebPageAnalysisData| Promise<any>                        | Updates a web page analysis in Weaviate based on the provided ID. |
| updateWebSolutions       | id: string, webSolutions: string[], quiet: boolean     | Promise<any>                        | Updates the solutions for a web page in Weaviate. |
| getWebPage               | id: string                                             | Promise<PsWebPageAnalysisData> | Retrieves a web page from Weaviate by ID. |
| getWebPagesForProcessing | groupId: number, subProblemIndex: number \| undefined \| null, entityIndex: number \| undefined \| null, searchType: PsSearchQueries \| undefined, limit: number, offset: number, solutionCountLimit: number \| undefined | Promise<PsWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria. |
| webPageExist             | groupId: number, url: string, searchType: PsWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise<Boolean>                    | Checks if a web page exists in Weaviate with the specified criteria. |
| searchWebPages           | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: PsWebPageTypes \| undefined, filterOutEmptySolutions: boolean | Promise<PsWebPageGraphQlResults> | Searches for web pages in Weaviate based on the query and other criteria. |

## Example

```typescript
import { BaseVectorStoreClient } from '@policysynth/agents/vectorstore/base/baseVectorStoreClient.js';

const client = new BaseVectorStoreClient();

// Example usage of adding a schema
client.addSchema().then(() => {
  console.log('Schema added successfully');
}).catch(err => {
  console.error('Failed to add schema:', err);
});

// Example usage of posting a web page
const webPageData = {
  url: "http://example.com",
  summary: "Example summary",
  // other necessary properties...
};
client.postWebPage(webPageData).then(response => {
  console.log('Web page posted:', response);
}).catch(err => {
  console.error('Failed to post web page:', err);
});
```