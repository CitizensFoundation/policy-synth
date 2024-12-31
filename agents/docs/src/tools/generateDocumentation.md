# DocumentationGenerator

This script is designed to automate the generation of API documentation for TypeScript files in a project. It utilizes OpenAI's GPT-4 model to generate detailed documentation in Markdown format. The script processes TypeScript files, checks for changes, and updates the documentation accordingly.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| openaiClient  | OpenAI | Instance of OpenAI client for API calls. |
| rootDir       | string | The root directory of the project. |
| docsDir       | string | Directory where documentation is stored. |
| checksumDir   | string | Directory where checksums are stored. |

## Methods

| Name                          | Parameters        | Return Type | Description                 |
|-------------------------------|-------------------|-------------|-----------------------------|
| renderSystemPrompt           | path: string, allTypeDefsData: string | string | Generates a system prompt for OpenAI API. |
| buildDirectoryTree           | dir: string, basePath?: string, isSrc?: boolean | any[] | Builds a directory tree structure. |
| generateMarkdownFromTree     | tree: any, depth?: number, basePath?: string | string | Generates Markdown from directory tree. |
| generateDocsReadme           | -                 | void        | Generates a README.md file for documentation. |
| findTSFiles                  | dir: string, fileList?: string[] | string[] | Finds all TypeScript files in a directory. |
| generateChecksum             | content: string   | string      | Generates a SHA-256 checksum for a file. |
| getAllTypeDefContents        | rootDir: string   | string      | Retrieves all TypeScript definition contents. |
| generateDocumentation        | fileList: string[] | Promise<void> | Generates documentation for a list of files. |
| main                         | -                 | Promise<void> | Main function to execute the script. |

## Example

```typescript
// Example usage of the documentation generator
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { OpenAI } from 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main(): Promise<void> {
  const tsFiles = findTSFiles(rootDir);
  generateDocsReadme();
  await generateDocumentation(tsFiles);
  generateDocsReadme();
}

main().then(() => console.log('Documentation generation complete.'));
```

This script is located at `@policysynth/agents/tools/generateDocumentation.js` and is designed to be run in a Node.js environment. It requires an OpenAI API key to function and will generate documentation for all TypeScript files in the project, excluding declaration files and files in the `node_modules` directory.