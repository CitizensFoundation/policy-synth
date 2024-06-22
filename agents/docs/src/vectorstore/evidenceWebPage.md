# EvidenceWebPageVectorStore

This class extends the PolicySynthScAgentBase to interact with Weaviate for storing and retrieving evidence web pages.

## Methods

| Name                          | Parameters                                                                 | Return Type                                  | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|----------------------------------------------|-----------------------------------------------------------------------------|
| addSchema                     |                                                                            | Promise<void>                                | Adds a schema for evidence web pages from a JSON file.                      |
| showScheme                    |                                                                            | Promise<void>                                | Shows the current schema for evidence web pages.                            |
| deleteScheme                  |                                                                            | Promise<void>                                | Deletes the schema for evidence web pages.                                  |
| testQuery                     |                                                                            | Promise<any>                                 | Tests a query against the evidence web pages.                               |
| postWebPage                   | webPageAnalysis: PSEvidenceRawWebPageData                                  | Promise<any>                                 | Posts a new evidence web page.                                              |
| updateWebPage                 | id: string, webPageAnalysis: PSEvidenceRawWebPageData                      | Promise<any>                                 | Updates an existing evidence web page.                                      |
| updateWebSolutions            | id: string, evidenceType: string, evidence: string[], quiet: boolean       | Promise<any>                                 | Updates the web solutions for an evidence web page.                         |
| saveWebPageMetadata           | id: string, metadata: PSWebPageMetadata, quiet: boolean                    | Promise<any>                                 | Saves metadata for an evidence web page.                                    |
| updateRefinedAnalysis         | id: string, refinedEvidence: PSRefinedPolicyEvidence, quiet: boolean       | Promise<any>                                 | Updates the refined analysis for an evidence web page.                      |
| updateScores                  | id: string, scores: PSPolicyRating, quiet: boolean                         | Promise<any>                                 | Updates the scores for an evidence web page.                                |
| getWebPage                    | id: string                                                                  | Promise<PSEvidenceRawWebPageData>             | Retrieves a specific evidence web page by ID.                               |
| getTopPagesForProcessing      | groupId: number, subProblemIndex: number \| undefined \| null, policyTitle: string \| undefined, searchType: string \| undefined, limit: number | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves the top pages for processing based on various criteria.          |
| getTopWebPagesForProcessing   | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined, onlyRefined: boolean | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves the top web pages for processing with additional filtering options. |
| getWebPagesForProcessing      | groupId: number, subProblemIndex: number \| undefined \| null, searchType: string \| undefined, policyTitle: string \| undefined, limit: number, offset: number, evidenceCountLimit: number \| undefined | Promise<PSEvidenceWebPageGraphQlResults> | Retrieves web pages for processing based on various criteria.              |
| webPageExist                  | groupId: number, url: string, searchType: PSEvidenceWebPageTypes, subProblemIndex: number \| undefined, entityIndex: number \| undefined | Promise<Boolean>                            | Checks if a web page exists based on given criteria.                        |
| searchWebPages                | query: string, groupId: number \| undefined, subProblemIndex: number \| undefined, searchType: PSEvidenceWebPageTypes \| undefined | Promise<PSEvidenceWebPageGraphQlResults>    | Searches for web pages based on a query and additional criteria.           |

## Example

```javascript
// Example usage of EvidenceWebPageVectorStore
import { EvidenceWebPageVectorStore } from '@policysynth/agents/vectorstore/evidenceWebPage.js';

const evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();

// Example: Adding a schema
evidenceWebPageVectorStore.addSchema().then(() => {
  console.log('Schema added successfully.');
}).catch((err) => {
  console.error('Error adding schema:', err);
});

// Example: Posting a new web page
const webPageAnalysis = {
  url: 'https://example.com',
  summary: 'This is an example summary.',
  // Other properties...
};

evidenceWebPageVectorStore.postWebPage(webPageAnalysis).then((res) => {
  console.log('Web page posted successfully:', res);
}).catch((err) => {
  console.error('Error posting web page:', err);
});
```