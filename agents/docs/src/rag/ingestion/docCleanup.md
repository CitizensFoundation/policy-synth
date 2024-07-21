# DocumentCleanupAgent

The `DocumentCleanupAgent` class is an extension of the `BaseIngestionAgent` class. It is designed to clean up documents by removing unwanted artifacts and reformatting paragraphs while ensuring the integrity and correctness of the content.

## Properties

| Name                                      | Type   | Description                                                                 |
|-------------------------------------------|--------|-----------------------------------------------------------------------------|
| `maxCleanupTokenLength`                   | number | The maximum token length for each cleanup part.                             |
| `maxCleanupRetries`                       | number | The maximum number of retries for cleaning a part.                          |
| `completionValidationSuccessMessage`      | string | Message indicating successful completion validation.                        |
| `correctnessValidationSuccessMessage`     | string | Message indicating successful correctness validation.                       |
| `hallucinationValidationSuccessMessage`   | string | Message indicating successful hallucination validation.                     |
| `hallucinationValidationSystemMessage`    | string | System message for hallucination validation.                                |
| `correctnessValidationSystemMessage`      | string | System message for correctness validation.                                  |
| `completionValidationSystemMessage`       | string | System message for completion validation.                                   |
| `validationUserMessage`                   | function | Function to create a user message for validation.                           |
| `systemMessage`                           | string | System message for document cleanup.                                        |
| `userMessage`                             | function | Function to create a user message for document cleanup.                     |
| `referencesCheckSystemMessage`            | string | System message for checking references.                                     |
| `referencesCheckUserMessage`              | function | Function to create a user message for checking references.                  |

## Methods

| Name                       | Parameters                                                                 | Return Type | Description                                                                 |
|----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| `clean`                    | `data: string`                                                             | `Promise<string>` | Cleans the provided document data.                                           |
| `validateCleanedPart`      | `original: string, cleaned: string`                                        | `Promise<{ valid: boolean; validationTextResults: string }>` | Validates the cleaned part of the document.                                  |
| `splitDataForProcessing`   | `data: string, maxTokenLength: number`                                     | `string[]`  | Splits the data into parts for processing.                                  |
| `logShortLines`            | `data: string`                                                             | `void`      | Logs short lines in the data.                                               |
| `callLLM`                  | `agent: string, messages: string[], streaming: boolean`                    | `Promise<string>` | Calls the LLM (Language Learning Model) for processing.                     |
| `getFirstMessages`         | `systemMessage: string, userMessage: string`                               | `string[]`  | Gets the first messages for the LLM call.                                   |
| `createSystemMessage`      | `message: string`                                                          | `string`    | Creates a system message.                                                   |
| `createHumanMessage`       | `message: string`                                                          | `string`    | Creates a human message.                                                    |

## Example

```typescript
import { DocumentCleanupAgent } from '@policysynth/agents/rag/ingestion/docCleanup.js';

const agent = new DocumentCleanupAgent();
const documentData = "Your document data here...";
agent.clean(documentData).then(cleanedData => {
  console.log("Cleaned Data:", cleanedData);
}).catch(error => {
  console.error("Error cleaning document:", error);
});
```

This example demonstrates how to use the `DocumentCleanupAgent` to clean a document. The `clean` method processes the document data and returns the cleaned data.