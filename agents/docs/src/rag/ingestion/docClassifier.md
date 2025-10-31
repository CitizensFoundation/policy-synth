# DocumentClassifierAgent

The `DocumentClassifierAgent` is an ingestion agent designed to analyze and classify documents into primary and (optionally) secondary categories using a language model. It extends the `BaseIngestionAgent` and is typically used in the context of RAG (Retrieval-Augmented Generation) pipelines for document ingestion and organization.

**File:** `@policysynth/agents/rag/ingestion/docClassifier.js`

---

## Properties

| Name           | Type                                                      | Description                                                                                  |
|----------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------|
| systemMessage  | (schema: string, about: string) => string                 | Generates the system prompt for the LLM, describing the classification task and context.     |
| userMessage    | (title: string, description: string, url: string) => string | Generates the user prompt for the LLM, providing the document details to classify.           |

---

## Methods

| Name                  | Parameters                                                                                      | Return Type | Description                                                                                                    |
|-----------------------|-------------------------------------------------------------------------------------------------|-------------|----------------------------------------------------------------------------------------------------------------|
| classify              | metadata: PsRagDocumentSource, dataLayout: PsIngestionDataLayout                                | Promise<void> | Classifies a single document using the LLM and updates its primary and secondary categories in-place.          |
| classifyAllDocuments  | documentSources: PsRagDocumentSource[], dataLayout: PsIngestionDataLayout                      | Promise<void> | Iterates over an array of documents, classifying each one and logging the results.                             |

---

## Method Details

### systemMessage

```typescript
systemMessage(schema: string, about: string): string
```
- **Description:**  
  Constructs a system prompt for the LLM, instructing it to act as a document classification expert. The prompt includes available categories and project context.
- **Parameters:**
  - `schema`: A stringified list of available categories (usually JSON).
  - `about`: A description of the project or context for classification.
- **Returns:**  
  A formatted string to be used as the system message for the LLM.

---

### userMessage

```typescript
userMessage(title: string, description: string, url: string): string
```
- **Description:**  
  Constructs a user prompt for the LLM, providing the document's title, description, and URL for classification.
- **Parameters:**
  - `title`: The document's title.
  - `description`: The full description of the document.
  - `url`: The document's URL.
- **Returns:**  
  A formatted string to be used as the user message for the LLM.

---

### classify

```typescript
async classify(
  metadata: PsRagDocumentSource,
  dataLayout: PsIngestionDataLayout
): Promise<void>
```
- **Description:**  
  Classifies a single document by calling the LLM with the constructed system and user messages. Updates the `primaryCategory` and `secondaryCategory` fields of the `metadata` object.
- **Parameters:**
  - `metadata`: The document source object to classify (will be mutated).
  - `dataLayout`: The ingestion data layout, including available categories and project context.
- **Returns:**  
  A promise that resolves when classification is complete.

---

### classifyAllDocuments

```typescript
async classifyAllDocuments(
  documentSources: PsRagDocumentSource[],
  dataLayout: PsIngestionDataLayout
): Promise<void>
```
- **Description:**  
  Iterates over an array of document sources, classifying each one in sequence and logging progress and results.
- **Parameters:**
  - `documentSources`: An array of document source objects to classify.
  - `dataLayout`: The ingestion data layout, including available categories and project context.
- **Returns:**  
  A promise that resolves when all documents have been classified.

---

## Example

```typescript
import { DocumentClassifierAgent } from '@policysynth/agents/rag/ingestion/docClassifier.js';

// Example document sources and data layout
const documentSources = [
  {
    title: "AI Policy in 2024",
    fullDescriptionOfAllContents: "A comprehensive overview of AI policy trends in 2024.",
    url: "https://example.com/ai-policy-2024",
    // ...other PsRagDocumentSource fields
  }
  // ...more documents
];

const dataLayout = {
  categories: ["Policy", "Technology", "Ethics"],
  aboutProject: "This project classifies documents related to AI policy.",
  jsonUrls: [],
  documentUrls: [],
};

const agent = new DocumentClassifierAgent();

await agent.classifyAllDocuments(documentSources, dataLayout);

console.log(documentSources[0].primaryCategory); // e.g., "Policy"
console.log(documentSources[0].secondaryCategory); // e.g., ""
```

---

**Note:**  
- The agent expects the `PsRagDocumentSource` and `PsIngestionDataLayout` types as defined in your project.
- The agent uses an LLM (via `callLLM`) to perform the classification, so ensure your environment is configured for LLM access.
- The `classifyAllDocuments` method processes documents sequentially and logs progress using the agent's logger.