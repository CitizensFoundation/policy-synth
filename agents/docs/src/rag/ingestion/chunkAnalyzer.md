# IngestionChunkAnalzyerAgent

This class extends `BaseIngestionAgent` to analyze chunks of text data and extract metadata, descriptions, and titles.

## Properties

| Name                   | Type          | Description               |
|------------------------|---------------|---------------------------|
| analysisSystemMessage  | SystemMessage | System message template for analysis instructions. |
| analysisUserMessage    | Function      | Function to generate user message for analysis. |

## Methods

| Name    | Parameters        | Return Type                | Description |
|---------|-------------------|----------------------------|-------------|
| analyze | data: string      | Promise<LlmChunkAnalysisReponse> | Analyzes the text data and returns structured analysis results. |

## Example

```typescript
import { IngestionChunkAnalzyerAgent } from '@policysynth/agents/rag/ingestion/chunkAnalyzer.js';

const analyzer = new IngestionChunkAnalzyerAgent();
analyzer.analyze("Sample text to analyze").then(response => {
  console.log(response);
}).catch(error => {
  console.error("Analysis failed:", error);
});
```