# IngestionChunkCompressorAgent

This class extends `BaseIngestionAgent` to provide functionality for compressing text chunks, validating the compression, and handling retries with adjustments based on validation feedback.

## Properties

| Name                                    | Type   | Description               |
|-----------------------------------------|--------|---------------------------|
| maxCompressionRetries                   | number | Maximum number of retries for compression. |
| retryCountBeforeRandomizingLlmTemperature | number | Retry count threshold before randomizing LLM temperature for varied responses. |
| completionValidationSuccessMessage      | string | Success message for completion validation. |
| correctnessValidationSuccessMessage     | string | Success message for correctness validation. |
| hallucinationValidationSuccessMessage   | string | Success message for hallucination validation. |
| hallucinationValidationSystemMessage    | SystemMessage | System message for hallucination validation. |
| correctnessValidationSystemMessage      | SystemMessage | System message for correctness validation. |
| completionValidationSystemMessage       | SystemMessage | System message for completion validation. |

## Methods

| Name                     | Parameters                                                                                                     | Return Type                             | Description |
|--------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------|-------------|
| validationUserMessage    | uncompressed: string, compressed: string                                                                       | HumanMessage                            | Generates a user message for validation with uncompressed and compressed text. |
| compressionSystemMessage | -                                                                                                              | SystemMessage                           | System message for initial compression instructions. |
| compressionRetrySystemMessage | -                                                                                                              | SystemMessage                           | System message for retrying compression with additional instructions. |
| compressionUserMessage   | data: string                                                                                                   | HumanMessage                            | Generates a user message for initial compression with original text. |
| compressionRetryUserMessage | data: string, lastCompressed: string, currentValidationResults: string, previousValidationResults: string, retryCount: number | HumanMessage                            | Generates a user message for retrying compression with details of previous attempts and suggestions for improvement. |
| compress                 | uncompressedData: string                                                                                       | Promise<string>                         | Compresses the given text, retries upon validation failure, and handles LLM temperature adjustments. |
| validateChunkSummary     | uncompressed: string, compressed: string                                                                       | Promise<{ valid: boolean; validationTextResults: string }> | Validates the compressed text against the uncompressed text for correctness and hallucination. |

## Example

```typescript
import { IngestionChunkCompressorAgent } from '@policysynth/agents/rag/ingestion/chunkCompressorAgent.js';

const compressorAgent = new IngestionChunkCompressorAgent();

const uncompressedText = "Your original long text here...";
const compressedText = await compressorAgent.compress(uncompressedText);

console.log("Compressed Text:", compressedText);
```