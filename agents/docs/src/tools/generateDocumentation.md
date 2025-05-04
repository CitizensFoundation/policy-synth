# generateDocumentation.js

This script automates the generation of Markdown API documentation for a TypeScript project, specifically for the PolicySynth Agents codebase. It leverages OpenAI's GPT models to generate documentation based on the source code and type definitions, and organizes the output into a structured `docs/` directory with checksums to avoid unnecessary regeneration.

## Overview

- **Purpose:**  
  Automatically generate and update Markdown documentation for all TypeScript files in the project, using type definitions and a consistent prompt for the AI model.
- **Key Features:**  
  - Recursively scans the project for `.ts` files (excluding `index.ts` and `.d.ts`).
  - Reads all type definitions to provide context for documentation.
  - Uses OpenAI's GPT-4.1 model to generate documentation in a standard Markdown format.
  - Maintains a checksum for each file to avoid regenerating unchanged documentation.
  - Builds a navigable directory tree in `docs/README.md`.

## Main Functions

### renderSystemPrompt

Generates the system prompt for the OpenAI API, embedding all type definitions and instructions for documentation format.

| Name             | Type     | Description                                                                                 |
|------------------|----------|---------------------------------------------------------------------------------------------|
| path             | string   | The file path to be documented, used for example import paths.                              |
| allTypeDefsData  | string   | All type definitions in the project, provided as context for the AI model.                  |
| **Returns**      | string   | The full system prompt to be sent to the OpenAI API.                                        |

---

### buildDirectoryTree

Recursively builds a representation of the documentation directory, flattening the `src` directory and skipping certain files.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| dir       | string   | The directory to scan.                                                                      |
| basePath  | string   | The base path for relative links (default: '').                                             |
| isSrc     | boolean  | Whether the current directory is the `src` directory (default: false).                      |
| **Returns** | any[]  | An array representing the directory structure (directories and files).                      |

---

### generateMarkdownFromTree

Converts the directory tree structure into a Markdown-formatted navigation list.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| tree      | any[]    | The directory tree as returned by `buildDirectoryTree`.                                     |
| depth     | number   | The current depth in the tree (default: 0).                                                 |
| basePath  | string   | The base path for links (default: 'src/').                                                  |
| **Returns** | string | The Markdown-formatted navigation list.                                                     |

---

### generateDocsReadme

Generates or updates the `docs/README.md` file with a navigable index of all generated documentation.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| *(none)*  |          | Scans the `docs/` directory and writes the index to `docs/README.md`.                      |

---

### findTSFiles

Recursively finds all `.ts` files in the project, excluding `index.ts` and `.d.ts` files.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| dir       | string   | The directory to scan.                                                                      |
| fileList  | string[] | The accumulator for found files (default: []).                                              |
| **Returns** | string[] | An array of file paths to `.ts` files.                                                    |

---

### generateChecksum

Generates a SHA-256 checksum for a given string.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| content   | string   | The content to hash.                                                                        |
| **Returns** | string | The SHA-256 checksum as a hex string.                                                      |

---

### getAllTypeDefContents

Reads all `.d.ts` files in the `src/` directory and concatenates their contents.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| rootDir   | string   | The root directory of the project.                                                          |
| **Returns** | string | The concatenated contents of all type definition files.                                     |

---

### generateDocumentation

Main function to generate documentation for all TypeScript files.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| fileList  | string[] | List of TypeScript file paths to document.                                                  |
| **Returns** | Promise<void> | Asynchronous; generates documentation and writes files as needed.                    |

**Key Steps:**
- Reads all type definitions for context.
- For each `.ts` file:
  - Computes a checksum and skips unchanged files.
  - Calls OpenAI's API with the system prompt and file content.
  - Writes the generated Markdown to the corresponding location in `docs/`.
  - Updates the checksum.

---

### main

Orchestrates the documentation generation process.

| Name      | Type     | Description                                                                                 |
|-----------|----------|---------------------------------------------------------------------------------------------|
| *(none)*  |          | Finds all `.ts` files, generates the docs index, and calls `generateDocumentation`.         |

---

## Example

```typescript
// Example usage: Run this script from the project root to generate documentation
// for all TypeScript files in the project.

import { main } from '@policysynth/agents/tools/generateDocumentation.js';

main().then(() => console.log('Documentation generation complete.'));
```

---

## Notes

- **OpenAI API Key:**  
  The script expects the `OPENAI_API_KEY` environment variable to be set.
- **Directory Structure:**  
  - Documentation is written to `docs/` mirroring the source structure.
  - Checksums are stored in `docs/cks/` to avoid unnecessary regeneration.
- **Customization:**  
  - The system prompt can be adjusted in `renderSystemPrompt` for different documentation styles.
  - The script is designed to be extensible for other codebases with similar needs.

---

## File Path

This script is located at:

```
@policysynth/agents/tools/generateDocumentation.js
```
