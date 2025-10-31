# generateDocumentation.js

This file provides an automated documentation generator for a TypeScript project, specifically for the PolicySynth Agents codebase. It scans the project for `.ts` files, generates Markdown documentation for each, and maintains a directory tree of documentation files. The documentation is generated using OpenAI's GPT-4.1 model, and only updates when source files change (using checksums for efficiency).

## Overview

- **Purpose:** Automatically generate and update Markdown API documentation for all TypeScript files in the project, using AI to ensure detailed and standardized output.
- **Key Features:**
  - Scans the project for `.ts` files (excluding `index.ts` and `.d.ts`).
  - Uses OpenAI to generate Markdown documentation for each file.
  - Maintains a checksum for each file to avoid unnecessary regeneration.
  - Builds a navigable directory tree in `docs/README.md`.
  - Ensures documentation is always in sync with the latest code changes.

## Main Functions

| Name                       | Parameters         | Return Type | Description                                                                                 |
|----------------------------|--------------------|-------------|---------------------------------------------------------------------------------------------|
| renderSystemPrompt         | path: string, allTypeDefsData: string | string      | Renders the system prompt for the OpenAI API, embedding type definitions and instructions.   |
| buildDirectoryTree         | dir: string, basePath?: string, isSrc?: boolean | any[]       | Recursively builds a tree structure of the documentation directory for navigation.           |
| generateMarkdownFromTree   | tree: any, depth?: number, basePath?: string    | string      | Converts the directory tree into Markdown navigation links.                                  |
| generateDocsReadme         |                    | void        | Generates the `docs/README.md` file with the documentation tree.                             |
| findTSFiles                | dir: string, fileList?: string[]                | string[]    | Recursively finds all `.ts` files (excluding `index.ts` and `.d.ts`) in the project.         |
| generateChecksum           | content: string                                 | string      | Generates a SHA-256 checksum for a file's content.                                          |
| getAllTypeDefContents      | rootDir: string                                 | string      | Aggregates all `.d.ts` type definition files for inclusion in the AI prompt.                 |
| generateDocumentation      | fileList: string[]                              | Promise<void> | Generates documentation for each TypeScript file using OpenAI, if the file has changed.      |
| main                       |                                                    | Promise<void> | Orchestrates the documentation generation process.                                           |

## Properties

| Name         | Type     | Description                                                                 |
|--------------|----------|-----------------------------------------------------------------------------|
| indexHeader  | string   | The header for the main documentation index.                                |
| openaiClient | OpenAI   | The OpenAI client instance for generating documentation.                    |
| rootDir      | string   | The root directory of the project.                                          |
| docsDir      | string   | The directory where documentation is stored.                                |
| checksumDir  | string   | The directory where file checksums are stored.                              |

## Example

```typescript
// Example usage: Run this script to generate documentation for all TypeScript files in the project.

import * as glob from 'glob';
import { PolicySynthAgentBase } from "../base/agentBase.js";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { OpenAI } from 'openai';

// ... (all function definitions as in the file above)

async function main(): Promise<void> {
  const tsFiles = findTSFiles(rootDir);
  generateDocsReadme();
  await generateDocumentation(tsFiles);
  generateDocsReadme();
}

main().then(() => PolicySynthAgentBase.logger.info('Documentation generation complete.'));
```

## Detailed Function Descriptions

### renderSystemPrompt

Renders a system prompt for the OpenAI API, embedding all type definitions and instructions for generating Markdown documentation.

- **Parameters:**
  - `path`: The file path for which documentation is being generated.
  - `allTypeDefsData`: All type definitions used in the project.
- **Returns:** A string containing the system prompt.

### buildDirectoryTree

Recursively builds a tree structure representing the documentation directory, used for generating navigation in the README.

- **Parameters:**
  - `dir`: The directory to scan.
  - `basePath`: The base path for relative links (optional).
  - `isSrc`: Whether the current directory is the `src` directory (optional).
- **Returns:** An array representing the directory tree.

### generateMarkdownFromTree

Converts the directory tree into a Markdown-formatted navigation list.

- **Parameters:**
  - `tree`: The directory tree structure.
  - `depth`: The current depth in the tree (optional).
  - `basePath`: The base path for links (optional).
- **Returns:** A Markdown string.

### generateDocsReadme

Generates the main `docs/README.md` file, containing the documentation index.

- **Parameters:** None.
- **Returns:** None.

### findTSFiles

Recursively finds all `.ts` files in the project, excluding `index.ts` and `.d.ts` files.

- **Parameters:**
  - `dir`: The directory to scan.
  - `fileList`: The list of files found so far (optional).
- **Returns:** An array of file paths.

### generateChecksum

Generates a SHA-256 checksum for a given string (file content).

- **Parameters:**
  - `content`: The content to hash.
- **Returns:** The checksum string.

### getAllTypeDefContents

Aggregates the contents of all `.d.ts` files in the `src` directory.

- **Parameters:**
  - `rootDir`: The root directory of the project.
- **Returns:** A string containing all type definitions.

### generateDocumentation

Generates documentation for each TypeScript file using OpenAI, only if the file has changed since the last generation.

- **Parameters:**
  - `fileList`: An array of TypeScript file paths.
- **Returns:** A Promise that resolves when documentation generation is complete.

### main

Orchestrates the documentation generation process: finds files, generates documentation, and updates the README.

- **Parameters:** None.
- **Returns:** A Promise.

---

**Note:**  
- The script expects an `OPENAI_API_KEY` environment variable to be set.
- Documentation is generated in the `docs/` directory, with checksums stored in `docs/cks/`.
- The script is intended to be run as a Node.js process.

---

## Example Output Structure

After running the script, the `docs/` directory will contain:

- Markdown documentation for each `.ts` file (mirroring the source structure).
- A `README.md` with a navigable index of all documentation files.
- A `cks/` directory with checksums for each documented file.

---

## Example Usage

```bash
OPENAI_API_KEY=sk-... node @policysynth/agents/tools/generateDocumentation.js
```

This will generate and update all documentation in the `docs/` directory.

---

## See Also

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [PolicySynth Agent Base](../base/agentBase.js)
