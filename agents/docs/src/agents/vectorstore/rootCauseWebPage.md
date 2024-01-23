# RootCauseWebPageVectorStore

The `RootCauseWebPageVectorStore` class extends `PolicySynthAgentBase` and is responsible for managing the storage and retrieval of web page vectors related to root causes. It interacts with a Weaviate instance to perform operations such as adding schemas, querying, and updating data related to web pages.

## Properties

| Name              | Type   | Description               |
|-------------------|--------|---------------------------|
| fieldsToExtract   | string | A static string containing the fields to extract during queries. |
| client            | WeaviateClient | A static instance of the Weaviate client configured with the scheme and host. |

## Methods

| Name                      | Parameters                                      | Return Type | Description                 |
|---------------------------|-------------------------------------------------|-------------|-----------------------------|
| addSchema                 | -                                               | Promise<void> | Reads a JSON schema from a file and adds it to the Weaviate schema. |
| showScheme                | -                                               | Promise<void> | Retrieves and logs the current Weaviate schema. |
| deleteScheme              | -                                               | Promise<void> | Deletes the "RootCauseWebPage" class from the Weaviate schema. |
| testQuery                 | -                                               | Promise<any> | Performs a test query on the "RootCauseWebPage" class. |
| postWebPage               | webPageAnalysis: PSRootCauseRawWebPageData      | Promise<any> | Posts a web page analysis to Weaviate. |
| updateWebPage             | id: string, webPageAnalysis: PSRootCauseRawWebPageData | Promise<any> | Updates a web page analysis in Weaviate. |
| updateWebRootCause        | id: string, rootCauseType: string, rootCauses: string[], quiet: boolean | Promise<any> | Updates the root cause information for a web page in Weaviate. |
| saveWebPageMetadata       | id: string, metadata: PSWebPageMetadata, quiet: boolean | Promise<any> | Saves metadata for a web page in Weaviate. |
| updateRefinedAnalysis     | id: string, refinedRootCause: PSRefinedRootCause, quiet: boolean | Promise<any> | Updates the refined root cause analysis for a web page in Weaviate. |
| updateScores              | id: string, scores: PSRootCauseRating, quiet: boolean | Promise<any> | Updates the scores for a web page's root cause analysis in Weaviate. |
| getWebPage                | id: string                                      | Promise<PSRootCauseRawWebPageData> | Retrieves a web page's analysis from Weaviate. |
| getTopPagesForProcessing  | groupId: number, searchType: string, limit: number | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves the top pages for processing based on the total score. |
| getTopWebPagesForProcessing | groupId: number, searchType: string, limit: number, offset: number, rootCauseCountLimit: number, onlyRefined: boolean | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves the top web pages for processing with additional filtering options. |
| getWebPagesForProcessing  | groupId: number, searchType: string, limit: number, offset: number, rootCauseCountLimit: number | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves web pages for processing with filtering options. |
| webPageExist              | groupId: number, url: string, searchType: PSRootCauseWebPageTypes | Promise<Boolean> | Checks if a web page already exists in Weaviate. |
| searchWebPages            | query: string, groupId: number, searchType: PSRootCauseWebPageTypes | Promise<PSRootCauseWebPageGraphQlResults> | Searches for web pages in Weaviate based on a query and optional filters. |

## Examples

```typescript
// Example usage of adding a schema
const vectorStore = new RootCauseWebPageVectorStore();
await vectorStore.addSchema();

// Example usage of posting a web page analysis
const webPageAnalysis = {
  // ... web page analysis data
};
await vectorStore.postWebPage(webPageAnalysis);

// Example usage of updating a web page analysis
const id = "some-id";
await vectorStore.updateWebPage(id, webPageAnalysis);

// Example usage of retrieving a web page analysis
const retrievedWebPage = await vectorStore.getWebPage(id);
console.log(retrievedWebPage);
```

Note: The actual implementation of `PSRootCauseRawWebPageData`, `PSWebPageMetadata`, `PSRefinedRootCause`, `PSRootCauseRating`, `PSRootCauseWebPageGraphQlResults`, and `PSRootCauseWebPageTypes` are not provided in the documentation. These are expected to be defined elsewhere in the codebase.