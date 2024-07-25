# IngestionChunkCompressorAgent

The `IngestionChunkCompressorAgent` class extends the `BaseIngestionAgent` and is responsible for compressing text data while ensuring that the compressed text retains all the essential details, meaning, and nuance of the original text. The class includes methods for compressing text, validating the compressed text, and retrying the compression process if necessary.

## Properties

| Name                                         | Type   | Description                                                                 |
|----------------------------------------------|--------|-----------------------------------------------------------------------------|
| `maxCompressionRetries`                      | number | Maximum number of retries for compression.                                  |
| `retryCountBeforeRandomizingLlmTemperature`  | number | Number of retries before randomizing the LLM temperature.                   |
| `completionValidationSuccessMessage`         | string | Success message for completion validation.                                  |
| `correctnessValidationSuccessMessage`        | string | Success message for correctness validation.                                 |
| `hallucinationValidationSuccessMessage`      | string | Success message for hallucination validation.                               |
| `hallucinationValidationSystemMessage`       | string | System message for hallucination validation.                                |
| `correctnessValidationSystemMessage`         | string | System message for correctness validation.                                  |
| `completionValidationSystemMessage`          | string | System message for completion validation.                                   |
| `validationUserMessage`                      | function | Function to create a user message for validation.                           |
| `compressionSystemMessage`                   | string | System message for initial compression.                                     |
| `compressionRetrySystemMessage`              | string | System message for retrying compression.                                    |
| `compressionUserMessage`                     | function | Function to create a user message for initial compression.                  |
| `compressionRetryUserMessage`                | function | Function to create a user message for retrying compression.                 |

## Methods

| Name                        | Parameters                                                                 | Return Type                                      | Description                                                                                       |
|-----------------------------|----------------------------------------------------------------------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `compress`                  | `uncompressedData: string`                                                 | `Promise<string>`                                | Compresses the given uncompressed text data.                                                      |
| `validateChunkSummary`      | `uncompressed: string, compressed: string`                                 | `Promise<{ valid: boolean; validationTextResults: string }>` | Validates the compressed text against the uncompressed text.                                      |

## Example

```typescript
import { IngestionChunkCompressorAgent } from '@policysynth/agents/rag/ingestion/chunkCompressorAgent.js';

const agent = new IngestionChunkCompressorAgent();

const uncompressedText = "This is a long text that needs to be compressed while retaining all its details, meaning, and nuance.";
agent.compress(uncompressedText).then(compressedText => {
  console.log("Compressed Text:", compressedText);
});
```

## Detailed Method Descriptions

### `compress`

```typescript
async compress(uncompressedData: string): Promise<string>
```

Compresses the given uncompressed text data. It retries the compression process up to a maximum number of retries if the validation fails. The method ensures that the compressed text retains all the essential details, meaning, and nuance of the original text.

**Parameters:**
- `uncompressedData` (string): The uncompressed text data to be compressed.

**Returns:**
- `Promise<string>`: The compressed text data.

### `validateChunkSummary`

```typescript
async validateChunkSummary(uncompressed: string, compressed: string): Promise<{ valid: boolean; validationTextResults: string }>
```

Validates the compressed text against the uncompressed text. It checks for the presence of all content, correctness, and absence of hallucinations in the compressed text.

**Parameters:**
- `uncompressed` (string): The original uncompressed text.
- `compressed` (string): The compressed text to be validated.

**Returns:**
- `Promise<{ valid: boolean; validationTextResults: string }>`: An object containing the validation result and validation text results.