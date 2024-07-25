# IngestionContentParser

The `IngestionContentParser` class is designed to handle the parsing of various file types, including PDF, HTML, DOCX, XLS, and plain text files. It provides methods to read and convert the content of these files into plain text.

## Properties

This class does not have any properties.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| parsePdf   | pdfBuffer: Buffer | Promise\<string\>  | Parses the content of a PDF file and returns it as a string. |
| parseHtml  | htmlText: string  | string      | Converts HTML content to plain text, skipping certain HTML elements. |
| parseDocx  | filePath: string  | Promise\<string\>  | Extracts and returns the raw text from a DOCX file. |
| parseXls   | filePath: string  | string      | Reads and converts the content of an XLS or XLSX file to plain text. |
| parseFile  | filePath: string  | Promise\<string\>  | Determines the file type and calls the appropriate parser method to return the file content as a string. |

## Example

```typescript
import { IngestionContentParser } from '@policysynth/agents/rag/ingestion/contentParser.js';

const parser = new IngestionContentParser();

async function exampleUsage() {
  try {
    const pdfText = await parser.parseFile('example.pdf');
    console.log('PDF Text:', pdfText);

    const htmlText = parser.parseHtml('<p>Hello, World!</p>');
    console.log('HTML Text:', htmlText);

    const docxText = await parser.parseDocx('example.docx');
    console.log('DOCX Text:', docxText);

    const xlsText = parser.parseXls('example.xlsx');
    console.log('XLS Text:', xlsText);

    const txtText = await parser.parseFile('example.txt');
    console.log('TXT Text:', txtText);
  } catch (error) {
    console.error('Error parsing file:', error);
  }
}

exampleUsage();
```

## Detailed Method Descriptions

### `parsePdf(pdfBuffer: Buffer): Promise<string>`

Parses the content of a PDF file and returns it as a string.

- **Parameters:**
  - `pdfBuffer` (Buffer): The buffer containing the PDF file data.
- **Returns:** `Promise<string>`: A promise that resolves to the parsed text content of the PDF.

### `parseHtml(htmlText: string): string`

Converts HTML content to plain text, skipping certain HTML elements.

- **Parameters:**
  - `htmlText` (string): The HTML content to be converted.
- **Returns:** `string`: The plain text representation of the HTML content.

### `parseDocx(filePath: string): Promise<string>`

Extracts and returns the raw text from a DOCX file.

- **Parameters:**
  - `filePath` (string): The path to the DOCX file.
- **Returns:** `Promise<string>`: A promise that resolves to the extracted text content of the DOCX file.

### `parseXls(filePath: string): string`

Reads and converts the content of an XLS or XLSX file to plain text.

- **Parameters:**
  - `filePath` (string): The path to the XLS or XLSX file.
- **Returns:** `string`: The plain text representation of the XLS or XLSX file content.

### `parseFile(filePath: string): Promise<string>`

Determines the file type and calls the appropriate parser method to return the file content as a string.

- **Parameters:**
  - `filePath` (string): The path to the file to be parsed.
- **Returns:** `Promise<string>`: A promise that resolves to the parsed text content of the file.

- **Throws:** `Error` if the file type is unsupported.