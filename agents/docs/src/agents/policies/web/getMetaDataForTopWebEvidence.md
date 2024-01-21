# GetMetaDataForTopWebEvidenceProcessor

The `GetMetaDataForTopWebEvidenceProcessor` class extends the `GetEvidenceWebPagesProcessor` class and is responsible for processing web pages to extract metadata. It fetches HTML and PDF content from URLs, extracts metadata using the `metascraper` library, and processes the content for evidence web pages.

## Properties

| Name                          | Type   | Description               |
|-------------------------------|--------|---------------------------|
| logger                        | Logger | Logger for logging information, debug messages, and errors. |
| memory                        | Memory | Memory object containing data relevant to the processor. |
| evidenceWebPageVectorStore    | EvidenceWebPageVectorStore | Vector store for saving web page metadata. |
| totalPagesSave                | number | Counter for the total number of pages saved. |

## Methods

| Name                          | Parameters                                                                 | Return Type | Description                 |
|-------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------|
| processPageText               | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Processes the text of a web page to extract metadata and save it. |
| getAndProcessPdf              | subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches and processes a PDF from a URL to extract text and metadata. |
| getAndProcessHtml             | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes, entityIndex: number \| undefined, policy: PSPolicy \| undefined | Promise<void> | Fetches and processes HTML content from a URL to extract metadata. |
| getAndProcessEvidencePage     | subProblemIndex: number, url: string, browserPage: Page, type: PSEvidenceWebPageTypes, policy: PSPolicy | Promise<boolean> | Determines the type of content (PDF or HTML) and processes it accordingly. |
| refineWebEvidence             | policy: PSPolicy, subProblemIndex: number, page: Page | Promise<void> | Refines web evidence by processing web pages and extracting metadata. |
| processSubProblems            | browser: Browser | Promise<void> | Processes sub-problems by refining web evidence for each. |
| getAllPages                   | - | Promise<void> | Launches a browser and processes all sub-problems to extract metadata from web pages. |
| process                       | - | Promise<void> | Main entry point for the processor to start processing web pages. |

## Examples

```typescript
// Example usage of the GetMetaDataForTopWebEvidenceProcessor class
const processor = new GetMetaDataForTopWebEvidenceProcessor();
processor.process().then(() => {
  console.log('Finished processing web pages for metadata extraction.');
});
```

Note: The actual implementation of the `Logger`, `Memory`, `EvidenceWebPageVectorStore`, and other dependencies are not provided in the documentation. The `processPageText`, `getAndProcessPdf`, `getAndProcessHtml`, `getAndProcessEvidencePage`, `refineWebEvidence`, `processSubProblems`, and `getAllPages` methods are all asynchronous and return promises. The `process` method is the main entry point for the processor to start its work.