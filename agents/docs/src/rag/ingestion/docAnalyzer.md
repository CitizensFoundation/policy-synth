# DocumentAnalyzerAgent

The `DocumentAnalyzerAgent` is an advanced ingestion agent designed to analyze and refine document content for RAG (Retrieval-Augmented Generation) pipelines. It processes large documents, extracts structured metadata, and refines summaries using LLMs (Large Language Models). This agent is typically used in document ingestion workflows to prepare documents for vector search and knowledge extraction.

**File:** `@policysynth/agents/rag/ingestion/docAnalyzer.js`

---

## Properties

| Name                        | Type      | Description                                                                                                    |
|-----------------------------|-----------|----------------------------------------------------------------------------------------------------------------|
| `maxAnalyzeTokenLength`     | `number`  | Maximum token length for each analysis chunk. Defaults to `8000`.                                              |
| `systemMessage`             | `string`  | System prompt for the initial document analysis, instructing the LLM on how to analyze and format output.      |
| `userMessage`               | `(data: string) => string` | Function to generate the user message for the LLM, providing the document data to analyze.           |
| `finalReviewSystemMessage`  | `string`  | System prompt for the final review/refinement step, instructing the LLM to refine and compress summaries.      |
| `finalReviewUserMessage`    | `(analysis: LlmDocumentAnalysisReponse) => string` | Function to generate the user message for the LLM during the refinement step.                    |

---

## Methods

| Name      | Parameters                                                                                                    | Return Type             | Description                                                                                                                      |
|-----------|---------------------------------------------------------------------------------------------------------------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `analyze` | `fileId: string, data: string, filesMetaData?: Record<string, PsRagDocumentSource>`                           | `Promise<PsRagDocumentSource>` | Analyzes a document, splits it into chunks if necessary, extracts metadata, refines summaries, and returns structured results.   |

---

### Method Details

#### `analyze`

Analyzes a document, extracts structured metadata, and refines the analysis using LLMs.

**Parameters:**
- `fileId` (`string`): The unique identifier for the document file.
- `data` (`string`): The raw text content of the document to analyze.
- `filesMetaData` (`Record<string, PsRagDocumentSource>`, optional): Existing metadata for files, used to accumulate results across multiple files.

**Returns:**  
`Promise<PsRagDocumentSource>` — The structured and refined metadata for the analyzed document.

**Process:**
1. Splits the document into chunks if it exceeds `maxAnalyzeTokenLength`.
2. For each chunk, calls the LLM with a system and user message to extract metadata and content summaries.
3. Aggregates results across chunks, merging metadata and lists.
4. Performs a final refinement step using the LLM to improve and compress the summary fields.
5. Returns the final structured metadata for the document.

---

## Types

### `RefineInput`

```typescript
interface RefineInput {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  documentDate: string;
  documentMetaData: { [key: string]: string };
  allImageUrls: string[];
  allReferencesWithUrls: { reference: string; url: string }[];
  allOtherReferences: string[];
}
```

### `LlmDocumentAnalysisReponse` (from project typedefs)

```typescript
interface LlmDocumentAnalysisReponse {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  compressedFullDescriptionOfAllContents?: string;
  allReferencesWithUrls: { reference: string; url: string }[];
  allImageUrls: string[];
  allOtherReferences: string[];
  documentDate: string;
  documentMetaData: { [key: string]: string };
}
```

### `PsRagDocumentSource` (from project typedefs)

```typescript
interface PsRagDocumentSource {
  id?: string;
  key: string;
  url: string;
  lastModified: string;
  lastModifiedOnServer: string;
  size: number;
  hash: string;
  fileId: string;
  cleanedDocument?: string;
  description?: string;
  shortDescription?: string;
  fullDescriptionOfAllContents?: string;
  compressedFullDescriptionOfAllContents?: string;
  title?: string;
  contentType: string;
  allReferencesWithUrls: { reference: string; url: string }[];
  allOtherReferences: string[];
  allImageUrls: string[];
  documentDate: string;
  documentMetaData: { [key: string]: string };
  // ...other fields
}
```

---

## Example

```typescript
import { DocumentAnalyzerAgent } from '@policysynth/agents/rag/ingestion/docAnalyzer.js';

const agent = new DocumentAnalyzerAgent();

const fileId = "doc-123";
const documentText = "This is the full text of the document to analyze...";
const filesMetaData = {};

agent.analyze(fileId, documentText, filesMetaData)
  .then((metadata) => {
    console.log("Structured document metadata:", metadata);
  })
  .catch((err) => {
    console.error("Error analyzing document:", err);
  });
```

---

## Usage Notes

- The agent is designed to work with large documents by splitting them into manageable chunks for LLM processing.
- It extracts and refines key metadata fields, including title, descriptions, image URLs, references, and document dates.
- The agent is suitable for use in document ingestion pipelines where high-quality, structured metadata is required for downstream tasks such as search, retrieval, or knowledge graph construction.
- The agent relies on LLM calls for both initial extraction and final refinement, so appropriate LLM infrastructure and API keys are required.

---

**See also:**  
- [`BaseIngestionAgent`](./baseAgent.js) — The base class providing core ingestion and LLM interaction utilities.
- [`PsRagDocumentSource`](#types) — The main output type for structured document metadata.
