# EvidenceWebPageVectorStore

The `EvidenceWebPageVectorStore` class extends the `PolicySynthAgentBase` class and provides methods for interacting with a Weaviate instance to manage evidence web pages. It includes methods for adding schemas, manipulating data, and querying evidence web pages.

## Properties

| Name   | Type            | Description |
|--------|-----------------|-------------|
| client | WeaviateClient  | A static instance of `WeaviateClient` configured with environment variables for the scheme and host. |

## Methods

| Name                         | Parameters                                             | Return Type | Description |
|------------------------------|--------------------------------------------------------|-------------|-------------|
| addSchema                    |                                                        | Promise<void> | Reads a JSON schema from a file and adds it to the Weaviate schema. |
| showScheme                   |                                                        | Promise<void> | Retrieves and logs the current schema from Weaviate. |
| deleteScheme                 |                                                        | Promise<void> | Deletes the "EvidenceWebPage" class from the Weaviate schema. |
| testQuery                    |                                                        | Promise<any> | Executes a test query against Weaviate and logs the results. |
| postWebPage                  | webPageAnalysis: PSEvidenceRawWebPageData              | Promise<any> | Posts a web page analysis to Weaviate. |
| updateWebPage                | id: string, webPageAnalysis: PSEvidenceRawWebPageData  | Promise<any> | Updates a web page analysis in Weaviate by ID. |
| updateWebSolutions           | id: string, evidenceType: string, evidence: string[], quiet: boolean | Promise<any> | Merges new evidence into an existing web page in Weaviate. |
| saveWebPageMetadata          | id: string, metadata: PSWebPageMetadata, quiet: boolean | Promise<any> | Merges new metadata into an existing web page in Weaviate. |
| updateRefinedAnalysis        | id: string, refinedEvidence: PSRefinedPolicyEvidence, quiet: boolean | Promise<any> | Merges refined evidence into an existing web page in Weaviate. |
| updateScores                 | id: string, scores: PSPolicyRating, quiet: boolean    | Promise<any> | Updates the scores of an existing web page in Weaviate. |
| getWebPage                   | id: string                                             | Promise<PSEvidenceRawWebPageData> | Retrieves a web page from Weaviate by ID. |
| getTopPagesForProcessing     | groupId: number, subProblemIndex: number \| undefined \| null, policyTitle: string \| undefined, searchType: string \| undefined, limit: number | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves top pages for processing based on various filters and sorting by total score. |
| getTopWebPagesForProcessing  | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined, onlyRefined: boolean | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves top web pages for processing with additional filters and pagination. |
| getWebPagesForProcessing     | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves web pages for processing with filters and pagination. |
| webPageExist                 | groupId: number, url: string, searchType: PSEvidenceWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise<Boolean> | Checks if a web page exists in Weaviate based on various criteria. |
| searchWebPages               | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: PSEvidenceWebPageTypes \| undefined | Promise<PSEvidenceWebPageGraphQlResults> | Searches for web pages in Weaviate using a text query and filters. |

## Examples

```typescript
// Example usage of adding a schema to Weaviate
const evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();
await evidenceWebPageVectorStore.addSchema();

// Example usage of posting a web page analysis to Weaviate
const webPageAnalysis = { /* ... */ };
await evidenceWebPageVectorStore.postWebPage(webPageAnalysis);

// Example usage of updating scores for a web page in Weaviate
const id = "some-id";
const scores = { evidenceQualityScore: 0.9, /* ... */ };
await evidenceWebPageVectorStore.updateScores(id, scores);
```

Note: The actual types for parameters such as `PSEvidenceRawWebPageData`, `PSWebPageMetadata`, `PSRefinedPolicyEvidence`, `PSPolicyRating`, and `PSEvidenceWebPageGraphQlResults` are not defined within the provided code and should be documented separately based on their definitions. Additionally, the `IEngineWebPageGraphQlSingleResult` and `IEngineWebPageAnalysisData` types used in the `getWebPage` and `webPageExist` methods respectively are also not defined in the provided code.