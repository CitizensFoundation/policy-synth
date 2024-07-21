# IngestionChunkAnalzyerAgent

The `IngestionChunkAnalzyerAgent` class extends the `BaseIngestionAgent` and is designed to analyze text for metadata, including title, short description, and full description of the contents. It uses a language model to perform the analysis and outputs the results in a JSON format.

## Properties

| Name                   | Type     | Description                                                                 |
|------------------------|----------|-----------------------------------------------------------------------------|
| analysisSystemMessage  | string   | System message template for the language model to set the context of analysis. |
| analysisUserMessage    | function | Function to create a user message for the language model with the text to analyze. |

## Methods

| Name       | Parameters        | Return Type            | Description                                                                 |
|------------|-------------------|------------------------|-----------------------------------------------------------------------------|
| analyze    | data: string      | Promise<LlmChunkAnalysisReponse> | Analyzes the provided text and returns the analysis in JSON format.          |

## Example

```typescript
import { IngestionChunkAnalzyerAgent } from '@policysynth/agents/rag/ingestion/chunkAnalyzer.js';

const agent = new IngestionChunkAnalzyerAgent();

const textToAnalyze = "Your text data here...";
agent.analyze(textToAnalyze)
  .then((analysis) => {
    console.log("Analysis Result:", analysis);
  })
  .catch((error) => {
    console.error("Analysis failed:", error);
  });
```

## Detailed Description

### Properties

#### `analysisSystemMessage`

- **Type:** `string`
- **Description:** This property holds the system message template that sets the context for the language model. It instructs the model to analyze the text for metadata and output the analysis in a specific JSON format.

#### `analysisUserMessage`

- **Type:** `(data: string) => string`
- **Description:** This function creates a user message for the language model. It takes the text to be analyzed as input and returns a formatted message that includes the text and prompts the model to output the analysis in JSON format.

### Methods

#### `analyze`

- **Parameters:**
  - `data: string`: The text data to be analyzed.
- **Returns:** `Promise<LlmChunkAnalysisReponse>`
- **Description:** This asynchronous method analyzes the provided text using a language model. It constructs the necessary messages, calls the language model, and returns the analysis in JSON format. If the analysis fails, it throws an error with a descriptive message.

### Usage Example

The example demonstrates how to create an instance of `IngestionChunkAnalzyerAgent`, analyze a piece of text, and handle the analysis result or any potential errors.

```typescript
import { IngestionChunkAnalzyerAgent } from '@policysynth/agents/rag/ingestion/chunkAnalyzer.js';

const agent = new IngestionChunkAnalzyerAgent();

const textToAnalyze = "Your text data here...";
agent.analyze(textToAnalyze)
  .then((analysis) => {
    console.log("Analysis Result:", analysis);
  })
  .catch((error) => {
    console.error("Analysis failed:", error);
  });
```

This example shows how to use the `IngestionChunkAnalzyerAgent` to analyze text and obtain metadata such as title, short description, and full description in a structured JSON format.