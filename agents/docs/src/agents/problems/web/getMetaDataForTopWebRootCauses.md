# GetMetaDataForTopWebRootCausesProcessor

This class extends `GetRootCausesWebPagesProcessor` and is responsible for processing web pages to extract metadata for top web root causes. It uses the `metascraper` library to extract metadata from HTML content and handles both HTML and PDF content.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| logger        | Logger | Logger for logging messages. |
| memory        | IEngineInnovationMemoryData | Memory data for the processor. |
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore | Vector store for root cause web pages. |
| totalPagesSave | number | Total number of pages saved. |

## Methods

| Name                               | Parameters                                                                                                      | Return Type | Description                                                                                   |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| processPageText                    | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a page to extract metadata and save it.                                  |
| getAndProcessPdf                   | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes a PDF document to extract text and metadata.                                        |
| getAndProcessHtml                  | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes an HTML page to extract text and metadata.                                          |
| getAndProcessRootCausePage         | url: string, browserPage: Page, type: PSRootCauseWebPageTypes                                                                                | Promise<boolean> | Processes a root cause page by determining if it's a PDF or HTML and then extracting metadata. |
| refineWebRootCauses                | page: Page                                                                                                       | Promise<void> | Refines web root causes by processing pages to extract metadata.                               |
| processSubProblems                 | browser: Browser                                                                                                 | Promise<void> | Processes subproblems by refining root causes.                                                |
| getAllPages                        | -                                                                                                                | Promise<void> | Launches a browser and processes all pages to extract metadata.                                |
| process                            | -                                                                                                                | Promise<void> | Main processing method that orchestrates the metadata extraction for web pages.                |

## Examples

```typescript
// Example usage of GetMetaDataForTopWebRootCausesProcessor
const processor = new GetMetaDataForTopWebRootCausesProcessor();
await processor.process();
```