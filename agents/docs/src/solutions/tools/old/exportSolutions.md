# ExportSolutions

This script reads a memory JSON file, processes it to generate an HTML document that outlines a problem statement, search queries, search results, sub-problems, and their solutions including pros and cons. It formats the data into a readable format and saves the HTML file.

## Properties

| Name                     | Type                                             | Description                                   |
|--------------------------|--------------------------------------------------|-----------------------------------------------|
| maxFullDetailSolutions   | number                                           | Maximum number of solutions to detail fully. |
| filePath                 | string                                           | Path to the memory JSON file.                |
| memoryData               | string                                           | Raw data read from the memory JSON file.     |
| memory                   | PsBaseMemoryData                     | Parsed memory data.                          |
| html                     | string                                           | HTML content being generated.                |

## Methods

| Name        | Parameters                        | Return Type | Description |
|-------------|-----------------------------------|-------------|-------------|
| formatElo   | elo: number \| undefined          | number      | Formats the ELO rating, defaulting to -1 if undefined. |
| (anonymous) | -                                 | void        | Main script execution, generating the HTML content and saving it to a file. |

## Example

```javascript
// Example usage to generate HTML from memory data
import { IEngineConstants } from '@policysynth/constants.js';
import fs from 'fs';
import process from 'process';
import path from 'path';

let filePath = process.argv[2] || "currentMemory.json";

if (!path.isAbsolute(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

console.log(`Reading memory from ${filePath}`);

const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData);

// Further processing and HTML generation follows...
```