# IngestionContentParser

A utility class for parsing and extracting text content from various file formats, including PDF, HTML, DOCX, TXT, JSON, and Markdown. This class is designed to be used in content ingestion pipelines, such as for RAG (Retrieval-Augmented Generation) or document analysis.

**File:** `@policysynth/agents/rag/ingestion/contentParser.js`

---

## Methods

| Name         | Parameters                                   | Return Type         | Description                                                                                      |
|--------------|----------------------------------------------|---------------------|--------------------------------------------------------------------------------------------------|
| parsePdf     | pdfBuffer: Buffer                            | Promise\<string\>   | Parses a PDF buffer and extracts the text content.                                               |
| parseHtml    | htmlText: string                             | string              | Converts HTML content to plain text, skipping links, images, forms, and navigation elements.      |
| parseDocx    | filePath: string                             | Promise\<string\>   | Extracts raw text from a DOCX file at the given file path.                                       |
| parseXls     | filePath: string                             | string              | (Stub) Intended to extract text from XLS/XLSX files. Currently returns an empty string.          |
| parseFile    | filePath: string                             | Promise\<string\>   | Determines file type by extension and calls the appropriate parser. Supports PDF, HTML, DOCX, TXT, JSON, and MD. Throws on unsupported types. |

---

## Method Details

### `async parsePdf(pdfBuffer: Buffer): Promise<string>`

Parses a PDF file from a buffer and extracts its text content.

- **Parameters:**
  - `pdfBuffer` (`Buffer`): The PDF file as a buffer.
- **Returns:** `Promise<string>` — The extracted text content.
- **Throws:** Rejects the promise if parsing fails.

---

### `parseHtml(htmlText: string): string`

Converts HTML content to plain text, skipping certain elements (links, images, forms, navigation).

- **Parameters:**
  - `htmlText` (`string`): The HTML content as a string.
- **Returns:** `string` — The plain text representation.

---

### `async parseDocx(filePath: string): Promise<string>`

Extracts raw text from a DOCX file.

- **Parameters:**
  - `filePath` (`string`): Path to the DOCX file.
- **Returns:** `Promise<string>` — The extracted text.

---

### `parseXls(filePath: string): string`

(Stub) Intended to extract text from XLS/XLSX files. Currently returns an empty string due to a known vulnerability in the XLSX library.

- **Parameters:**
  - `filePath` (`string`): Path to the XLS/XLSX file.
- **Returns:** `string` — Always returns an empty string.

---

### `async parseFile(filePath: string): Promise<string>`

Determines the file type by extension and calls the appropriate parser. Supports PDF, HTML, DOCX, TXT, JSON, and Markdown files.

- **Parameters:**
  - `filePath` (`string`): Path to the file.
- **Returns:** `Promise<string>` — The extracted text content.
- **Throws:** Throws an error if the file type is unsupported.

---

## Example

```typescript
import { IngestionContentParser } from '@policysynth/agents/rag/ingestion/contentParser.js';

const parser = new IngestionContentParser();

async function example() {
  // Parse a PDF file
  const pdfText = await parser.parseFile('/path/to/document.pdf');
  console.log(pdfText);

  // Parse an HTML file
  const htmlText = await parser.parseFile('/path/to/page.html');
  console.log(htmlText);

  // Parse a DOCX file
  const docxText = await parser.parseFile('/path/to/document.docx');
  console.log(docxText);

  // Parse a plain text file
  const txtText = await parser.parseFile('/path/to/file.txt');
  console.log(txtText);

  // Attempting to parse an unsupported file type
  try {
    await parser.parseFile('/path/to/file.xls');
  } catch (err) {
    console.error(err.message); // "Unsupported file type: .xls"
  }
}

example();
```

---

**Note:**  
- XLS/XLSX parsing is currently disabled due to a high-severity vulnerability in the XLSX library.
- The class is designed for use in Node.js environments and relies on external libraries for parsing specific formats.  
- For PDF parsing, the `pdfreader` library is used; for DOCX, `mammoth`; for HTML, `html-to-text`.  
- The `parseFile` method is the main entry point for file ingestion and dispatches to the appropriate parser based on file extension.