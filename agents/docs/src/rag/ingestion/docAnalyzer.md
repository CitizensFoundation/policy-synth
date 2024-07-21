# DocumentAnalyzerAgent

The `DocumentAnalyzerAgent` class is an extension of the `BaseIngestionAgent` designed to analyze documents, extract relevant metadata, and refine the analysis for better comprehension and storage.

## Properties

| Name                          | Type   | Description                                                                 |
|-------------------------------|--------|-----------------------------------------------------------------------------|
| `maxAnalyzeTokenLength`       | number | Maximum token length for analyzing document chunks.                         |
| `systemMessage`               | string | System message template for the initial document analysis.                  |
| `userMessage`                 | (data: string) => string | Function to create a user message for document analysis.                    |
| `finalReviewSystemMessage`    | string | System message template for refining the document analysis.                 |
| `finalReviewUserMessage`      | (analysis: LlmDocumentAnalysisReponse) => string | Function to create a user message for refining the document analysis.       |

## Methods

| Name                | Parameters                                                                 | Return Type              | Description                                                                 |
|---------------------|---------------------------------------------------------------------------|--------------------------|-----------------------------------------------------------------------------|
| `analyze`           | `fileId: string, data: string, filesMetaData: Record<string, PsRagDocumentSource> = {}` | `Promise<PsRagDocumentSource>` | Analyzes the document, refines the analysis, and returns the metadata.      |
| `splitDataForProcessingWorksBigChunks` | `data: string, maxLength: number` | `string[]` | Splits the data into chunks for processing if it exceeds the maximum length. |
| `callLLM`           | `agentName: string, messages: any[]` | `Promise<any>` | Calls the language model for processing the messages.                       |
| `getFirstMessages`  | `systemMessage: string, userMessage: string` | `any[]` | Prepares the initial messages for the language model.                       |
| `createSystemMessage` | `message: string` | `string` | Creates a system message for the language model.                            |
| `createHumanMessage` | `message: string` | `string` | Creates a human message for the language model.                             |

## Example

```typescript
import { DocumentAnalyzerAgent } from '@policysynth/agents/rag/ingestion/docAnalyzer.js';

const agent = new DocumentAnalyzerAgent();
const fileId = 'example-file-id';
const documentData = '...'; // Your document data here
const filesMetaData = {};

agent.analyze(fileId, documentData, filesMetaData).then((metadata) => {
  console.log('Analyzed Metadata:', metadata);
});
```

This class is designed to handle the analysis of documents by breaking them into manageable chunks, processing each chunk, and then refining the results to produce a comprehensive metadata object. The `analyze` method is the primary method used to perform this analysis and refinement.