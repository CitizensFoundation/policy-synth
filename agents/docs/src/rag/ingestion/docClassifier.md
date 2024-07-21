# DocumentClassifierAgent

The `DocumentClassifierAgent` class extends the `BaseIngestionAgent` and is responsible for classifying documents into primary and secondary categories based on their content.

## Properties

| Name           | Type     | Description                                                                 |
|----------------|----------|-----------------------------------------------------------------------------|
| systemMessage  | Function | Generates a system message for the classification agent.                    |
| userMessage    | Function | Generates a user message containing the document details for classification.|

## Methods

| Name                | Parameters                                                                 | Return Type | Description                                                                                       |
|---------------------|----------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------|
| systemMessage       | schema: string, about: string                                              | string      | Creates a system message with instructions and available categories for the classification agent. |
| userMessage         | title: string, description: string, url: string                            | string      | Creates a user message with the document details to be classified.                                |
| classify            | metadata: PsRagDocumentSource, dataLayout: PsIngestionDataLayout           | Promise<void> | Classifies a single document and updates its primary and secondary categories.                    |
| classifyAllDocuments| documentSources: PsRagDocumentSource[], dataLayout: PsIngestionDataLayout  | Promise<void> | Classifies all documents in the provided list and updates their categories.                       |

## Example

```typescript
import { DocumentClassifierAgent } from '@policysynth/agents/rag/ingestion/docClassifier.js';

const agent = new DocumentClassifierAgent();

const metadata = {
  title: "Sample Document",
  fullDescriptionOfAllContents: "This is a sample document for classification.",
  url: "http://example.com/sample-document"
};

const dataLayout = {
  categories: ["Category1", "Category2", "Category3"],
  aboutProject: "This project is about classifying documents into predefined categories."
};

agent.classify(metadata, dataLayout).then(() => {
  console.log(`Primary Category: ${metadata.primaryCategory}`);
  console.log(`Secondary Category: ${metadata.secondaryCategory}`);
});
```

## Detailed Method Descriptions

### systemMessage

```typescript
systemMessage = (schema: string, about: string) => string
```

Generates a system message for the classification agent with instructions and available categories.

- **Parameters:**
  - `schema` (string): The available categories in JSON format.
  - `about` (string): Information about the project.

- **Returns:**
  - `string`: The generated system message.

### userMessage

```typescript
userMessage = (title: string, description: string, url: string) => string
```

Generates a user message containing the document details for classification.

- **Parameters:**
  - `title` (string): The title of the document.
  - `description` (string): The full description of the document.
  - `url` (string): The URL of the document.

- **Returns:**
  - `string`: The generated user message.

### classify

```typescript
async classify(
  metadata: PsRagDocumentSource,
  dataLayout: PsIngestionDataLayout
): Promise<void>
```

Classifies a single document and updates its primary and secondary categories.

- **Parameters:**
  - `metadata` (PsRagDocumentSource): The metadata of the document to be classified.
  - `dataLayout` (PsIngestionDataLayout): The data layout containing available categories and project information.

- **Returns:**
  - `Promise<void>`: A promise that resolves when the classification is complete.

### classifyAllDocuments

```typescript
async classifyAllDocuments(
  documentSources: PsRagDocumentSource[],
  dataLayout: PsIngestionDataLayout
): Promise<void>
```

Classifies all documents in the provided list and updates their categories.

- **Parameters:**
  - `documentSources` (PsRagDocumentSource[]): The list of document sources to be classified.
  - `dataLayout` (PsIngestionDataLayout): The data layout containing available categories and project information.

- **Returns:**
  - `Promise<void>`: A promise that resolves when all classifications are complete.
```