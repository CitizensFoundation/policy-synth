# DocumentCleanupAgent

This class extends `BaseIngestionAgent` to provide functionalities for cleaning up documents by removing unwanted artifacts and ensuring the text is correctly formatted and validated against the original content.

## Properties

| Name                                  | Type   | Description               |
|---------------------------------------|--------|---------------------------|
| maxCleanupTokenLength                 | number | Maximum length of tokens for cleanup. |
| maxCleanupRetries                     | number | Maximum number of retries for cleaning a document part. |
| completionValidationSuccessMessage    | string | Success message for completion validation. |
| correctnessValidationSuccessMessage   | string | Success message for correctness validation. |
| hallucinationValidationSuccessMessage | string | Success message for hallucination validation. |
| hallucinationValidationSystemMessage  | SystemMessage | System message for hallucination validation. |
| correctnessValidationSystemMessage    | SystemMessage | System message for correctness validation. |
| completionValidationSystemMessage     | SystemMessage | System message for completion validation. |
| validationUserMessage                 | function | Function to generate user message for validation. |
| systemMessage                         | SystemMessage | System message for document cleanup instructions. |
| userMessage                           | function | Function to generate user message for document cleanup. |
| referencesCheckSystemMessage          | SystemMessage | System message for checking references in the document. |
| referencesCheckUserMessage            | function | Function to generate user message for reference check. |

## Methods

| Name                | Parameters                                  | Return Type | Description                 |
|---------------------|---------------------------------------------|-------------|-----------------------------|
| clean               | data: string                                | Promise<string> | Cleans the provided document data by removing unwanted content and reformatting. |
| validateCleanedPart | original: string, cleaned: string           | Promise<{ valid: boolean; validationTextResults: string }> | Validates the cleaned part of the document against the original to ensure correctness, completeness, and absence of hallucinations. |

## Example

```typescript
import { DocumentCleanupAgent } from '@policysynth/agents/rag/ingestion/docCleanup.js';

const cleanupAgent = new DocumentCleanupAgent();

const originalText = "Original document text with artifacts and unnecessary content.";
const cleanedText = await cleanupAgent.clean(originalText);

console.log(cleanedText);
```