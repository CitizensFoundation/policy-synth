# DocumentClassifierAgent

This class extends `BaseIngestionAgent` to provide functionality for classifying documents based on provided metadata and data layout. It utilizes system and user messages to interact with a language model for classification.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| systemMessage | (schema: string, about: string) => SystemMessage | Method that returns a system message formatted with classification instructions and project details. |
| userMessage   | (title: string, description: string, url: string) => HumanMessage | Method that returns a user message formatted with document details for classification. |

## Methods

| Name                  | Parameters                                      | Return Type | Description                 |
|-----------------------|-------------------------------------------------|-------------|-----------------------------|
| classify              | metadata: PsRagDocumentSource, dataLayout: PsIngestionDataLayout | Promise<void> | Classifies a single document using the language model and updates the metadata with classification results. |
| classifyAllDocuments  | documentSources: PsRagDocumentSource[], dataLayout: PsIngestionDataLayout | Promise<void> | Iterates over an array of document sources and classifies each document, logging the classification results. |

## Example

```typescript
import { DocumentClassifierAgent } from '@policysynth/agents/rag/ingestion/docClassifier.js';
import { PsRagDocumentSource, PsIngestionDataLayout } from '@policysynth/agents/rag/ingestion/types.js';

const classifier = new DocumentClassifierAgent();

const documentSource: PsRagDocumentSource = {
  title: "Example Document",
  fullDescriptionOfAllContents: "Detailed description of the document contents.",
  url: "http://example.com/document",
  primaryCategory: "",
  secondaryCategory: ""
};

const dataLayout: PsIngestionDataLayout = {
  categories: ["Technology", "Health", "Finance"],
  aboutProject: "Project to classify documents into relevant categories."
};

async function runClassification() {
  await classifier.classify(documentSource, dataLayout);
  console.log(`Primary Category: ${documentSource.primaryCategory}`);
  console.log(`Secondary Category: ${documentSource.secondaryCategory}`);
}

runClassification();
```