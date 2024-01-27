# Documentation Generation Script

This script is designed to automatically generate Markdown documentation for TypeScript files within a project. It leverages the OpenAI API to create detailed documentation based on the content of each TypeScript file. The script also manages documentation updates by comparing file checksums to detect changes.

## Properties

No properties are explicitly defined in this script as it primarily consists of functions.

## Methods

| Name                    | Parameters            | Return Type            | Description                                                                 |
|-------------------------|-----------------------|------------------------|-----------------------------------------------------------------------------|
| `buildDirectoryTree`    | dir: string, basePath: string = '', isSrc: boolean = false | any[] | Builds a hierarchical structure of the project's directories and Markdown files. |
| `generateMarkdownFromTree` | tree: any, depth: number = 0 | string | Generates Markdown content representing the directory tree structure. |
| `generateDocsReadme`    | None                  | void                   | Generates a README.md file in the docs directory with a structured list of all documentation files. |
| `findTSFiles`           | dir: string, fileList: string[] = [] | string[] | Recursively searches for TypeScript files in the specified directory, excluding `node_modules` and declaration files. |
| `generateChecksum`      | content: string       | string                 | Generates a SHA-256 checksum for the given file content. |
| `generateDocumentation` | fileList: string[]    | Promise<void>          | Generates Markdown documentation for each TypeScript file in the provided list, if changes are detected. |
| `main`                  | None                  | Promise<void>          | The main function that orchestrates the documentation generation process. |

## Events

This script does not define or use any events.

## Example

```typescript
// Class example
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { OpenAI } from 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main(): Promise<void> {
  // Example usage of functions within the script
  const rootDir = process.cwd();
  const tsFiles = findTSFiles(rootDir);
  await generateDocumentation(tsFiles);
}

main().then(() => console.log('Documentation generation complete.'));
```

This example demonstrates how to use the script's functions to generate documentation. It initializes the OpenAI client with an API key, finds TypeScript files within the project, and generates documentation for them.