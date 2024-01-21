# RootCauseWebPageVectorStore

The `RootCauseWebPageVectorStore` class is responsible for managing the storage and retrieval of web page vectors related to root causes. It interacts with a Weaviate instance to perform operations such as adding schemas, querying data, and updating records.

## Properties

| Name              | Type   | Description                                           |
|-------------------|--------|-------------------------------------------------------|
| fieldsToExtract   | string | A string containing the fields to extract from queries. |
| client            | WeaviateClient | An instance of the Weaviate client for making API requests. |

## Methods

| Name                     | Parameters                                      | Return Type | Description                                                                 |
|--------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| addSchema                | -                                               | Promise<void> | Reads a schema from a file and adds it to the Weaviate instance.             |
| showScheme               | -                                               | Promise<void> | Retrieves and logs the current schema from the Weaviate instance.            |
| deleteScheme             | -                                               | Promise<void> | Deletes the schema for the class `RootCauseWebPage` from the Weaviate instance. |
| testQuery                | -                                               | Promise<any> | Performs a test query on the Weaviate instance and logs the results.        |
| postWebPage              | webPageAnalysis: PSRootCauseRawWebPageData      | Promise<any> | Posts a web page analysis to the Weaviate instance.                         |
| updateWebPage            | id: string, webPageAnalysis: PSRootCauseRawWebPageData | Promise<any> | Updates a web page analysis in the Weaviate instance.                       |
| updateWebRootCause       | id: string, rootCauseType: string, rootCauses: string[], quiet: boolean | Promise<any> | Updates the root causes for a web page in the Weaviate instance.            |
| saveWebPageMetadata      | id: string, metadata: PSWebPageMetadata, quiet: boolean | Promise<any> | Saves metadata for a web page in the Weaviate instance.                     |
| updateRefinedAnalysis    | id: string, refinedRootCause: PSRefinedRootCause, quiet: boolean | Promise<any> | Updates the refined analysis for a root cause in the Weaviate instance.     |
| updateScores             | id: string, scores: PSRootCauseRating, quiet: boolean | Promise<any> | Updates the scores for a root cause in the Weaviate instance.                |
| getWebPage               | id: string                                      | Promise<PSRootCauseRawWebPageData> | Retrieves a web page by ID from the Weaviate instance.                      |
| getTopPagesForProcessing | groupId: number, searchType: string, limit: number | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves the top pages for processing based on the total score.             |
| getTopWebPagesForProcessing | groupId: number, searchType: string, limit: number, offset: number, rootCauseCountLimit: number, onlyRefined: boolean | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves the top web pages for processing with additional filters.          |
| getWebPagesForProcessing | groupId: number, searchType: string, limit: number, offset: number, rootCauseCountLimit: number | Promise<PSRootCauseWebPageGraphQlResults> | Retrieves web pages for processing with specified filters.                   |
| webPageExist             | groupId: number, url: string, searchType: PSRootCauseWebPageTypes | Promise<Boolean> | Checks if a web page exists in the Weaviate instance.                       |
| searchWebPages           | query: string, groupId: number, searchType: PSRootCauseWebPageTypes | Promise<PSRootCauseWebPageGraphQlResults> | Searches for web pages in the Weaviate instance based on a query and filters. |

## Examples

```typescript
// Example usage of the RootCauseWebPageVectorStore class
const vectorStore = new RootCauseWebPageVectorStore();

// Adding a schema to the Weaviate instance
await vectorStore.addSchema();

// Posting a web page analysis
const webPageAnalysis = {
  // ... web page analysis data
};
await vectorStore.postWebPage(webPageAnalysis);

// Updating a web page analysis
const webPageId = "some-id";
await vectorStore.updateWebPage(webPageId, webPageAnalysis);

// Retrieving a web page by ID
const retrievedWebPage = await vectorStore.getWebPage(webPageId);
console.log(retrievedWebPage);
```

Note: The `PSRootCauseRawWebPageData`, `PSWebPageMetadata`, `PSRefinedRootCause`, `PSRootCauseRating`, and `PSRootCauseWebPageGraphQlResults` types are not defined in the provided code snippet and should be defined elsewhere in the codebase. The `IEngineWebPageGraphQlSingleResult` and `IEngineWebPageAnalysisData` types are also referenced but not defined in the snippet.