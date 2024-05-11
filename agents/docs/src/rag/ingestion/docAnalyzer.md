# DocumentAnalyzerAgent

This class extends `BaseIngestionAgent` to analyze documents and refine their content into structured JSON format. It handles large documents by splitting them into manageable chunks, analyzing each chunk, and then refining the analysis to produce a final structured output.

## Properties

| Name                    | Type                | Description               |
|-------------------------|---------------------|---------------------------|
| maxAnalyzeTokenLength   | number              | Maximum length of text tokens that can be analyzed at once. |
| systemMessage           | SystemMessage       | Initial system message to guide the document analysis. |
| userMessage             | (data: string) => HumanMessage | Function to generate a user message for document analysis. |
| finalReviewSystemMessage| SystemMessage       | System message for guiding the refinement of the document analysis. |
| finalReviewUserMessage  | (analysis: LlmDocumentAnalysisReponse) => HumanMessage | Function to generate a user message for reviewing the document analysis refinement. |

## Methods

| Name    | Parameters                                                                 | Return Type            | Description |
|---------|----------------------------------------------------------------------------|------------------------|-------------|
| analyze | fileId: string, data: string, filesMetaData: Record<string, PsRagDocumentSource> = {} | Promise<PsRagDocumentSource> | Analyzes the document data in chunks, processes each chunk, and refines the results into a structured JSON format. |

## Example

```typescript
import { DocumentAnalyzerAgent } from '@policysynth/agents/rag/ingestion/docAnalyzer.js';

const analyzer = new DocumentAnalyzerAgent();
const fileId = "file123";
const documentData = "Here is a long document text...";
const filesMetaData = {};

analyzer.analyze(fileId, documentData, filesMetaData)
  .then(result => {
    console.log("Analysis Complete:", result);
  })
  .catch(error => {
    console.error("Analysis Failed:", error);
  });
```