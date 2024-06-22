# BaseIngestionAgent

The `BaseIngestionAgent` class is an abstract class that extends `PolicySynthScAgentBase`. It provides various methods and properties to handle data ingestion, processing, and interaction with the OpenAI language model.

## Properties

| Name                     | Type    | Description                                                                 |
|--------------------------|---------|-----------------------------------------------------------------------------|
| minChunkTokenLength      | number  | Minimum token length for a chunk of data. Default is 1000.                  |
| maxChunkTokenLength      | number  | Maximum token length for a chunk of data. Default is 3500.                  |
| maxFileProcessTokenLength| number  | Maximum token length for processing a file. Default is 110000.              |
| roughFastWordTokenRatio  | number  | Ratio used to estimate token length from word count. Default is 1.25.       |
| chat                     | ChatOpenAI | Instance of the ChatOpenAI class for interacting with the OpenAI model.    |

## Methods

| Name                          | Parameters                                                                 | Return Type   | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------|
| constructor                   | -                                                                          | -             | Initializes the `BaseIngestionAgent` and sets up the `ChatOpenAI` instance. |
| resetLlmTemperature           | -                                                                          | void          | Resets the temperature of the language model to the default value.          |
| randomizeLlmTemperature       | -                                                                          | void          | Randomizes the temperature of the language model within a specified range.  |
| logShortLines                 | text: string, maxLength: number = 50                                       | void          | Logs the first 100 characters of each line of the given text.               |
| splitDataForProcessing        | data: string, maxTokenLength: number = this.maxFileProcessTokenLength      | string[]      | Splits the data into chunks for processing, ensuring natural breaks.        |
| parseJsonFromLlmResponse      | data: string                                                               | any           | Parses JSON content from a language model response.                         |
| splitDataForProcessingWorksBigChunks | data: string, maxTokenLength: number = this.maxFileProcessTokenLength | string[]      | Splits data into large chunks, ensuring natural breaks and list integrity.  |
| getEstimateTokenLength        | data: string                                                               | number        | Estimates the token length of the given data.                               |
| computeHash                   | data: Buffer \| string                                                     | string        | Computes the SHA-256 hash of the given data.                                |
| getFirstMessages              | systemMessage: SystemMessage, userMessage: BaseMessage                     | BaseMessage[] | Returns an array of the first messages, including system and user messages. |
| getFileName                   | url: string, isJsonData: boolean                                           | string        | Generates a file name based on the URL and whether the data is JSON.        |
| getExternalUrlsFromJson       | jsonData: any                                                              | string[]      | Extracts external URLs from the given JSON data.                            |
| generateFileId                | url: string                                                                | string        | Generates a unique file ID based on the URL using MD5 hash.                 |

## Example

```typescript
import { BaseIngestionAgent } from '@policysynth/agents/rag/ingestion/baseAgent.js';

class MyIngestionAgent extends BaseIngestionAgent {
  // Implement abstract methods and additional functionality here
}

const agent = new MyIngestionAgent();
agent.logShortLines("This is a test text to log short lines.");
const chunks = agent.splitDataForProcessing("Some large text data...");
console.log(chunks);
```