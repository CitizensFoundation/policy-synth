# IngestionContentParser

This class provides methods to parse different types of document files such as PDF, HTML, DOCX, and XLSX into text format.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| parsePdf   | pdfBuffer: Buffer | Promise<string> | Parses a PDF file buffer into a string of text. |
| parseHtml  | htmlText: string  | string      | Converts HTML text to plain text, ignoring certain elements like links and images. |
| parseDocx  | filePath: string  | Promise<string> | Extracts raw text from a DOCX file located at the specified path. |
| parseXls   | filePath: string  | string      | Reads an XLS or XLSX file and converts its contents to plain text. |
| parseFile  | filePath: string  | Promise<string> | Determines the file type by its extension and invokes the appropriate parser. Handles various file types including PDF, HTML, DOCX, XLS/XLSX, TXT, JSON, and MD. |

## Example

```typescript
import { IngestionContentParser } from '@policysynth/agents/rag/ingestion/contentParser.js';

async function demoParse() {
  const parser = new IngestionContentParser();
  try {
    const textFromPdf = await parser.parsePdf(Buffer.from('path/to/pdf'));
    console.log(textFromPdf);

    const textFromHtml = parser.parseHtml('<html><body>Hello World</body></html>');
    console.log(textFromHtml);

    const textFromDocx = await parser.parseDocx('path/to/docx');
    console.log(textFromDocx);

    const textFromXls = parser.parseXls('path/to/xls');
    console.log(textFromXls);

    const textFromFile = await parser.parseFile('path/to/any/supported/file');
    console.log(textFromFile);
  } catch (error) {
    console.error('Error parsing file:', error);
  }
}

demoParse();
```