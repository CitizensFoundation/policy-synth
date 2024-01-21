# GetRootCausesWebPagesProcessor

The `GetRootCausesWebPagesProcessor` class is responsible for processing web pages to identify and analyze potential root causes of various types within the text content of the pages. It extends the `GetWebPagesProcessor` class and utilizes a vector store for root cause web pages, AI analysis, and a browser instance to navigate and process the content of web pages.

## Properties

| Name                        | Type                                      | Description                                                                 |
|-----------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore               | An instance of `RootCauseWebPageVectorStore` used to store web page vectors. |
| chat                        | ChatOpenAI                                | An instance of `ChatOpenAI` used for AI analysis.                            |
| logger                      | Logger                                    | An instance of a logging service for logging messages.                       |
| memory                      | IEngineInnovationMemoryData \| undefined  | Memory data related to the engine's current state.                           |
| totalPagesSave              | number                                    | A counter for the total number of pages saved.                               |

## Methods

| Name                             | Parameters                                                                 | Return Type                     | Description                                                                                   |
|----------------------------------|----------------------------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| renderRootCauseScanningPrompt    | type: PSRootCauseWebPageTypes, text: string                               | SystemMessage[], HumanMessage[] | Renders the prompt for scanning a web page for root causes.                                   |
| getRootCauseTokenCount           | text: string, type: PSRootCauseWebPageTypes                               | Promise\<object\>               | Calculates the token count for the given text and type.                                       |
| getRootCauseTextAnalysis         | type: PSRootCauseWebPageTypes, text: string                               | Promise\<object\>               | Analyzes the text for root causes and returns the analysis data.                              |
| getRootCauseAIAnalysis           | type: PSRootCauseWebPageTypes, text: string                               | Promise\<object\>               | Performs AI analysis on the text for root causes.                                             |
| mergeAnalysisData                | data1: PSRootCauseRawWebPageData, data2: PSRootCauseRawWebPageData        | PSRootCauseRawWebPageData       | Merges two sets of analysis data into one.                                                    |
| processPageText                  | text: string, subProblemIndex, url: string, type, entityIndex, policy     | Promise\<void\>                 | Processes the text of a web page and saves the analysis.                                      |
| getAndProcessRootCausePage       | url: string, browserPage: Page, type: PSRootCauseWebPageTypes             | Promise\<boolean\>              | Retrieves and processes a root cause web page.                                                |
| processRootCauses                | browser: Browser                                                          | Promise\<void\>                 | Processes root causes for all search result types.                                            |
| getAllPages                      |                                                                          | Promise\<void\>                 | Launches a browser and processes all pages for root causes.                                   |
| process                          |                                                                          | Promise\<void\>                 | Main processing method that orchestrates the retrieval and analysis of root cause web pages.   |

## Examples

```typescript
// Example usage of the GetRootCausesWebPagesProcessor class
const processor = new GetRootCausesWebPagesProcessor();
processor.process().then(() => {
  console.log(`Processed root cause web pages and saved ${processor.totalPagesSave} pages.`);
}).catch(error => {
  console.error("Error processing root cause web pages:", error);
});
```

Note: The actual implementation of the methods and their interactions with other components like `ChatOpenAI`, `RootCauseWebPageVectorStore`, and the browser instance are not detailed in this documentation.