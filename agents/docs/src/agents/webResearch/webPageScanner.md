# WebPageScanner

The `WebPageScanner` class extends the `GetWebPagesProcessor` class and is responsible for scanning web pages, processing their content, and collecting data based on a given JSON schema. It can handle both HTML and PDF content, and it integrates with an AI model for analysis.

## Properties

| Name                     | Type                          | Description                                           |
|--------------------------|-------------------------------|-------------------------------------------------------|
| jsonSchemaForResults     | string \| undefined           | The JSON schema used to output the results.           |
| systemPromptOverride     | string \| undefined           | An optional override for the system prompt.           |
| collectedWebPages        | any[]                         | An array to store the collected web page data.        |
| progressFunction         | Function \| undefined         | An optional function to report progress.              |

## Methods

| Name                     | Parameters                                                                 | Return Type                        | Description                                                                                   |
|--------------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| constructor              |                                                                            |                                    | Initializes the class with default values.                                                    |
| renderScanningPrompt     | problemStatement: IEngineProblemStatement, text: string, subProblemIndex?: number, entityIndex?: number | SystemMessage[]                    | Generates the prompt messages for scanning based on the problem statement and text context.   |
| getTokenCount            | text: string, subProblemIndex: number \| undefined                        | Promise<{ totalTokenCount: number, promptTokenCount: any }> | Calculates the token count for a given text.                                                  |
| getAIAnalysis            | text: string, subProblemIndex?: number, entityIndex?: number              | Promise<IEngineWebPageAnalysisData> | Retrieves AI analysis for the given text.                                                     |
| getAllTextForTokenCheck  | text: string, subProblemIndex: number \| undefined                        | string                             | Concatenates prompt messages and text for token count checking.                               |
| processPageText          | text: string, subProblemIndex: number \| undefined, url: string, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined, policy?: PSPolicy | Promise<void \| PSRefinedRootCause[]> | Processes the text of a web page and performs analysis.                                       |
| getAndProcessPage        | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes \| PSEvidenceWebPageTypes \| PSRootCauseWebPageTypes, entityIndex: number \| undefined | Promise<boolean>                   | Processes a web page based on its URL and type.                                               |
| scan                     | listOfUrls: string[], jsonSchemaForResults: string, scanSystemPrompt?: string \| undefined, progressFunction?: Function \| undefined | Promise<any[]>                     | Scans a list of URLs, processes their content, and collects data based on the JSON schema.    |

## Examples

```typescript
// Example usage of the WebPageScanner class
const webPageScanner = new WebPageScanner();
const urlsToScan = ['https://example.com', 'https://anotherexample.com'];
const jsonSchema = '{ "type": "object", "properties": { "title": { "type": "string" } } }';

webPageScanner.scan(urlsToScan, jsonSchema).then(collectedData => {
  console.log(collectedData);
});
```

Note: The example provided assumes that the necessary types such as `IEngineProblemStatement`, `IEngineWebPageAnalysisData`, `IEngineWebPageTypes`, `PSEvidenceWebPageTypes`, `PSRootCauseWebPageTypes`, and `PSPolicy` are defined elsewhere in the codebase and are imported correctly for the `WebPageScanner` class to function as intended.