# EvidenceWebPageVectorStore

The `EvidenceWebPageVectorStore` class is responsible for interacting with a Weaviate instance to manage the schema and data for evidence web pages. It provides methods to add, update, delete, and query evidence web pages in the Weaviate database.

## Properties

| Name   | Type            | Description                                      |
|--------|-----------------|--------------------------------------------------|
| client | WeaviateClient  | Static Weaviate client instance.                 |

## Methods

| Name                      | Parameters                                             | Return Type | Description                                                                 |
|---------------------------|--------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| addSchema                 |                                                        | Promise     | Reads a schema from a file and adds it to the Weaviate instance.             |
| showScheme                |                                                        | Promise     | Retrieves and logs the current schema from the Weaviate instance.            |
| deleteScheme              |                                                        | Promise     | Deletes the "EvidenceWebPage" class from the Weaviate schema.                |
| testQuery                 |                                                        | Promise     | Performs a test query on the "EvidenceWebPage" class.                        |
| postWebPage               | webPageAnalysis: PSEvidenceRawWebPageData              | Promise     | Posts a new web page analysis to the Weaviate instance.                      |
| updateWebPage             | id: string, webPageAnalysis: PSEvidenceRawWebPageData  | Promise     | Updates an existing web page analysis in the Weaviate instance.              |
| updateWebSolutions        | id: string, evidenceType: string, evidence: string[], quiet: boolean | Promise | Updates evidence solutions for a web page.                                   |
| saveWebPageMetadata       | id: string, metadata: PSWebPageMetadata, quiet: boolean | Promise    | Saves metadata for a web page.                                               |
| updateRefinedAnalysis     | id: string, refinedEvidence: PSRefinedPolicyEvidence, quiet: boolean | Promise | Updates refined evidence analysis for a web page.                            |
| updateScores              | id: string, scores: PSPolicyRating, quiet: boolean     | Promise     | Updates scores for a web page.                                               |
| getWebPage                | id: string                                             | Promise     | Retrieves a web page analysis by ID.                                         |
| getTopPagesForProcessing  | groupId: number, subProblemIndex: number \| undefined \| null, policyTitle: string \| undefined, searchType: string \| undefined, limit: number | Promise | Retrieves top pages for processing based on various filters.                  |
| getTopWebPagesForProcessing | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined, onlyRefined: boolean | Promise | Retrieves top web pages for processing with additional filters and pagination. |
| getWebPagesForProcessing  | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined | Promise | Retrieves web pages for processing with filters and pagination.               |
| webPageExist              | groupId: number, url: string, searchType: PSEvidenceWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise | Checks if a web page exists in the Weaviate instance.                        |
| searchWebPages            | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: PSEvidenceWebPageTypes \| undefined | Promise | Searches for web pages based on a query and filters.                          |

## Examples

```typescript
// Example usage of adding a schema to the Weaviate instance
const evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();
await evidenceWebPageVectorStore.addSchema();
```

```typescript
// Example usage of posting a new web page analysis
const webPageAnalysis = {
  // ... web page analysis data
};
await evidenceWebPageVectorStore.postWebPage(webPageAnalysis);
```

```typescript
// Example usage of updating scores for a web page
const scores = {
  evidenceQualityScore: 0.9,
  evidenceRelevanceToPolicyProposalScore: 0.8,
  // ... other scores
};
await evidenceWebPageVectorStore.updateScores("webPageId", scores);
```

```typescript
// Example usage of checking if a web page exists
const exists = await evidenceWebPageVectorStore.webPageExist(1, "http://example.com", "Research", undefined, undefined);
console.log(exists); // Outputs: true or false
```

Please note that the actual implementation of `PSEvidenceRawWebPageData`, `PSWebPageMetadata`, `PSRefinedPolicyEvidence`, `PSPolicyRating`, `PSEvidenceWebPageGraphQlResults`, `PSEvidenceWebPageTypes`, `IEngineWebPageGraphQlSingleResult`, `IEngineWebPageAnalysisData`, and `IEngineConstants` are not included in the documentation as they are not part of the main class.