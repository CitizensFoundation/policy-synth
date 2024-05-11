# BaseIngestionAgent

Abstract class that extends `PolicySynthAgentBase` to provide functionalities specific to data ingestion processes.

## Properties

| Name                      | Type   | Description                                       |
|---------------------------|--------|---------------------------------------------------|
| minChunkTokenLength       | number | Minimum token length for a chunk of data.         |
| maxChunkTokenLength       | number | Maximum token length for a chunk of data.         |
| maxFileProcessTokenLength | number | Maximum token length for processing a file.       |
| roughFastWordTokenRatio   | number | Estimated ratio of words to tokens for quick calculations. |

## Methods

| Name                               | Parameters                                         | Return Type        | Description                                                                 |
|------------------------------------|----------------------------------------------------|--------------------|-----------------------------------------------------------------------------|
| constructor                        |                                                    |                    | Initializes a new instance of `BaseIngestionAgent`.                         |
| resetLlmTemperature                |                                                    | void               | Resets the LLM temperature to the default value from `PsIngestionConstants`.|
| randomizeLlmTemperature            |                                                    | void               | Randomizes the LLM temperature within a specified range.                    |
| logShortLines                      | text: string, maxLength: number = 50               | void               | Logs short lines of the given text up to the specified maximum length.      |
| splitDataForProcessing             | data: string, maxTokenLength: number = this.maxFileProcessTokenLength | string[] | Splits data into manageable parts for processing based on token length.     |
| parseJsonFromLlmResponse           | data: string                                       | any                | Parses JSON content from a string that includes LLM response formatting.    |
| splitDataForProcessingWorksBigChunks | data: string, maxTokenLength: number = this.maxFileProcessTokenLength | string[] | Splits large chunks of data for processing, considering natural breaks.     |
| getEstimateTokenLength             | data: string                                       | number             | Estimates the token length of the given data based on a rough word-to-token ratio. |
| computeHash                        | data: Buffer \| string                             | string             | Computes the SHA-256 hash of the given data.                                |
| getFirstMessages                   | systemMessage: SystemMessage, userMessage: BaseMessage | BaseMessage[]  | Returns an array of system and user messages.                               |
| getFileName                        | url: string, isJsonData: boolean                   | string             | Generates a filename based on the URL and whether the data is JSON.         |
| getExternalUrlsFromJson            | jsonData: any                                      | string[]           | Extracts and returns all external URLs from the given JSON data.            |
| generateFileId                     | url: string                                        | string             | Generates a file ID based on the MD5 hash of the URL.                        |

## Example

```typescript
import { BaseIngestionAgent } from '@policysynth/agents/rag/ingestion/baseAgent.js';

class CustomIngestionAgent extends BaseIngestionAgent {
  // Custom implementation details
}

const agent = new CustomIngestionAgent();
agent.resetLlmTemperature();
const chunks = agent.splitDataForProcessing("Some long text data...");
console.log(chunks);
```