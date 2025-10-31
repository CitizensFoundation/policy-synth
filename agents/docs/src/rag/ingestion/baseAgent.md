# BaseIngestionAgent

An abstract base class for document ingestion agents in the PolicySynth system. This class provides utility methods for processing, splitting, and handling large text or JSON data, as well as file and hash management. It extends `PolicySynthSimpleAgentBase` and is intended to be subclassed for specific ingestion agent implementations.

**File:** `@policysynth/agents/rag/ingestion/baseAgent.js`

---

## Properties

| Name                        | Type      | Description                                                                                 |
|-----------------------------|-----------|---------------------------------------------------------------------------------------------|
| minChunkTokenLength         | number    | Minimum token length for a chunk when splitting data. Default: `1000`.                      |
| maxChunkTokenLength         | number    | Maximum token length for a chunk when splitting data. Default: `3500`.                      |
| maxFileProcessTokenLength   | number    | Maximum token length for processing a file. Default: `110000`.                              |
| roughFastWordTokenRatio     | number    | Approximate ratio of words to tokens for fast estimation. Default: `1.25`.                  |
| maxModelTokensOut           | number    | Maximum number of tokens the model can output. Default: `4096`.                             |
| modelTemperature            | number    | Temperature parameter for the model (controls randomness). Default: `0.0`.                  |

---

## Methods

| Name                                | Parameters                                                                                                    | Return Type         | Description                                                                                                                      |
|------------------------------------- |--------------------------------------------------------------------------------------------------------------|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| logShortLines                       | text: string, maxLength?: number                                                                             | void                | Logs the first `maxLength` characters of each line in the input text (default: 50).                                             |
| splitDataForProcessing              | data: string, maxTokenLength?: number                                                                        | string[]            | Splits input data into chunks, attempting to break at natural line breaks and avoid splitting sentences or lists.                |
| parseJsonFromLlmResponse            | data: string                                                                                                 | any                 | Extracts and parses JSON content from a string, typically from an LLM response. Logs errors if parsing fails.                    |
| splitDataForProcessingWorksBigChunks| data: string, maxTokenLength?: number                                                                        | string[]            | Alternative chunking method for large data, prioritizing big chunks and avoiding breaking lists or sentences.                    |
| getEstimateTokenLength              | data: string                                                                                                 | number              | Estimates the token length of a string using a rough word-to-token ratio.                                                        |
| computeHash                         | data: Buffer \| string                                                                                       | string              | Computes a SHA-256 hash of the input data and returns it as a hex string.                                                        |
| getFirstMessages                    | systemMessage: PsModelMessage, userMessage: PsModelMessage                                                   | PsModelMessage[]    | Returns an array containing the system and user messages, in order.                                                              |
| getFileName                         | url: string, isJsonData: boolean                                                                             | string              | Generates a file path for caching, using a hash of the URL and a suitable file extension.                                        |
| getExternalUrlsFromJson             | jsonData: any                                                                                                | string[]            | Recursively extracts all external URLs (http/https) from a JSON object or array.                                                 |
| generateFileId                      | url: string                                                                                                  | string              | Generates a unique file ID (MD5 hash) for a given URL.                                                                           |

---

## Example

```typescript
import { BaseIngestionAgent } from '@policysynth/agents/rag/ingestion/baseAgent.js';

class MyCustomIngestionAgent extends BaseIngestionAgent {
  async ingestDocument(url: string, data: string) {
    // Split the data into manageable chunks
    const chunks = this.splitDataForProcessing(data);

    // Log the first 50 characters of each line for debugging
    this.logShortLines(data);

    // Compute a hash for the document
    const docHash = this.computeHash(data);

    // Get a cache file name for the document
    const fileName = this.getFileName(url, false);

    // Extract all external URLs from a JSON response
    const externalUrls = this.getExternalUrlsFromJson(JSON.parse(data));

    // ... further processing ...
  }
}
```

---

## Notes

- This class is **abstract** and should be subclassed for concrete ingestion agent implementations.
- It provides robust utilities for chunking, parsing, and managing large text or JSON data, which is essential for RAG (Retrieval-Augmented Generation) pipelines.
- The methods are designed to be resilient to various data formats and to avoid splitting in the middle of sentences or list items, which is important for downstream NLP tasks.
- The class expects a `logger` property (inherited from `PolicySynthSimpleAgentBase`) for logging operations.
