# BaseIngestionAgent

The `BaseIngestionAgent` class is an abstract class that extends the `PolicySynthSimpleAgentBase`. It provides various methods and properties to handle data ingestion, processing, and splitting for further analysis or storage.

## Properties

| Name                      | Type    | Description                                                                 |
|---------------------------|---------|-----------------------------------------------------------------------------|
| minChunkTokenLength       | number  | Minimum token length for a chunk. Default is 1000.                          |
| maxChunkTokenLength       | number  | Maximum token length for a chunk. Default is 3500.                          |
| maxFileProcessTokenLength | number  | Maximum token length for processing a file. Default is 110000.              |
| roughFastWordTokenRatio   | number  | Rough ratio of words to tokens. Default is 1.25.                            |
| maxModelTokensOut         | number  | Maximum tokens output by the model. Default is 4096.                        |
| modelTemperature          | number  | Temperature setting for the model. Default is 0.0.                          |

## Methods

| Name                          | Parameters                                                                 | Return Type | Description                                                                                       |
|-------------------------------|----------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------|
| logShortLines                 | text: string, maxLength: number = 50                                       | void        | Logs the first 100 characters of each line of the provided text.                                  |
| splitDataForProcessing        | data: string, maxTokenLength: number = this.maxFileProcessTokenLength      | string[]    | Splits the data into chunks for processing, ensuring natural breaks and avoiding mid-sentence splits. |
| parseJsonFromLlmResponse      | data: string                                                               | any         | Parses JSON content from a response string.                                                       |
| splitDataForProcessingWorksBigChunks | data: string, maxTokenLength: number = this.maxFileProcessTokenLength | string[]    | Splits the data into larger chunks for processing, ensuring natural breaks and avoiding mid-sentence splits. |
| getEstimateTokenLength        | data: string                                                               | number      | Estimates the token length of the provided data.                                                  |
| computeHash                   | data: Buffer \| string                                                     | string      | Computes the SHA-256 hash of the provided data.                                                   |
| getFirstMessages              | systemMessage: PsModelMessage, userMessage: PsModelMessage                 | PsModelMessage[] | Returns an array containing the system and user messages.                                         |
| getFileName                   | url: string, isJsonData: boolean                                           | string      | Generates a file name based on the URL and whether the data is JSON.                              |
| getExternalUrlsFromJson       | jsonData: any                                                              | string[]    | Extracts external URLs from the provided JSON data.                                               |
| generateFileId                | url: string                                                                | string      | Generates a file ID based on the URL using MD5 hash.                                              |

## Example

```typescript
import { BaseIngestionAgent } from '@policysynth/agents/rag/ingestion/baseAgent.js';

class MyIngestionAgent extends BaseIngestionAgent {
  // Implement abstract methods and additional functionality here
}

const agent = new MyIngestionAgent();
const data = "Some large text data...";
const chunks = agent.splitDataForProcessing(data);
console.log(chunks);
```

This example demonstrates how to extend the `BaseIngestionAgent` class and use its `splitDataForProcessing` method to split large text data into manageable chunks.