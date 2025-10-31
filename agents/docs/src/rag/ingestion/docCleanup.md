# DocumentCleanupAgent

The `DocumentCleanupAgent` class is an advanced ingestion agent designed to clean up documents (such as PDFs) for use in Retrieval-Augmented Generation (RAG) chatbots. It removes unwanted artifacts, reformats paragraphs, and validates the cleaned output using multiple LLM-based checks to ensure content integrity, correctness, and absence of hallucinations.

Inherits from: [`BaseIngestionAgent`](./baseAgent.js)

---

## Properties

| Name                                   | Type      | Description                                                                                                    |
|---------------------------------------- |-----------|----------------------------------------------------------------------------------------------------------------|
| `maxCleanupTokenLength`                 | `number`  | Maximum token length for each chunk to be cleaned (default: 4000).                                             |
| `maxCleanupRetries`                     | `number`  | Maximum number of retries for cleaning and validation (default: 15).                                           |
| `completionValidationSuccessMessage`    | `string`  | Success message for completion validation.                                                                     |
| `correctnessValidationSuccessMessage`   | `string`  | Success message for correctness validation.                                                                    |
| `hallucinationValidationSuccessMessage` | `string`  | Success message for hallucination validation.                                                                  |
| `hallucinationValidationSystemMessage`  | `string`  | System prompt for hallucination validation.                                                                    |
| `correctnessValidationSystemMessage`    | `string`  | System prompt for correctness validation.                                                                      |
| `completionValidationSystemMessage`     | `string`  | System prompt for completion validation.                                                                       |
| `validationUserMessage`                 | `(original: string, cleaned: string) => string` | Function to generate user message for validation.                                              |
| `systemMessage`                         | `string`  | System prompt for the main document cleanup task.                                                              |
| `userMessage`                           | `(data: string, validationTextResults: string | undefined) => string` | Function to generate user message for cleanup, including validation errors if any. |
| `referencesCheckSystemMessage`          | `string`  | System prompt for checking if a document contains only references or URLs.                                     |
| `referencesCheckUserMessage`            | `(data: string) => string` | Function to generate user message for reference check.                                         |

---

## Methods

| Name                    | Parameters                                                                 | Return Type                                                                 | Description                                                                                                    |
|-------------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `clean`                 | `data: string`                                                            | `Promise<string>`                                                           | Cleans the input document, splitting it into manageable parts, cleaning each part, validating, and joining the results. |
| `validateCleanedPart`   | `original: string, cleaned: string`                                       | `Promise<{ valid: boolean; validationTextResults: string }>`                | Validates a cleaned part using three LLM-based checks: completion, correctness, and hallucination.             |

---

## Method Details

### `async clean(data: string): Promise<string>`

- **Description:**  
  Cleans a document by splitting it into parts, cleaning each part (with retries and validation), and joining the cleaned parts.
- **Process:**
  1. Splits the input data into chunks based on `maxCleanupTokenLength`.
  2. Merges small chunks with previous ones for efficiency.
  3. For each chunk:
     - Cleans the chunk using LLM.
     - Validates the cleaned chunk (up to `maxCleanupRetries`).
     - If the chunk contains only references/URLs, it is skipped.
  4. Processes chunks with a concurrency limit (10).
  5. Returns the joined cleaned document.

### `async validateCleanedPart(original: string, cleaned: string): Promise<{ valid: boolean; validationTextResults: string }>`
- **Description:**  
  Validates a cleaned document part by running three LLM-based checks:
  - **Completion:** All main content is present.
  - **Correctness:** All content is correct (ignoring cleaned artifacts).
  - **Hallucination:** No additional content was introduced.
- **Returns:**  
  An object with:
  - `valid`: `true` if all checks pass, `false` otherwise.
  - `validationTextResults`: Concatenated results of all validation checks.

---

## Example

```typescript
import { DocumentCleanupAgent } from '@policysynth/agents/rag/ingestion/docCleanup.js';

const agent = new DocumentCleanupAgent();

const rawDocument = `
1. Introduction
This is a sample document.

Table of Contents
1. Introduction
2. Methods

References
[1] Some reference
`;

(async () => {
  const cleaned = await agent.clean(rawDocument);
  console.log(cleaned);
})();
```

---

## Usage Notes

- The agent is designed for robust document cleanup, especially for artifacts from PDF conversions.
- It uses LLM calls for both cleaning and validation, ensuring high-quality output.
- The agent can be extended or customized by overriding system/user messages or validation logic.
- Handles concurrency and retries for efficient and reliable processing of large documents.

---

**File:** `@policysynth/agents/rag/ingestion/docCleanup.js`