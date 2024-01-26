# Policy Synth ExpressJS API Documentation

This script is designed to automate the generation of documentation for TypeScript files within a project. It leverages the OpenAI API to generate detailed markdown documentation based on the content of each TypeScript file. The script also includes functionality to avoid regenerating documentation for files that have not changed since the last documentation generation, using SHA-256 checksums for comparison.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| openaiClient  | OpenAI | Instance of the OpenAI client initialized with an API key. |
| rootDir       | string | The current working directory of the project. |
| docsDir       | string | The directory where generated documentation will be stored. |
| checksumDir   | string | The directory where checksums of TypeScript files are stored to detect changes. |

## Methods

| Name                      | Parameters                  | Return Type | Description                 |
|---------------------------|-----------------------------|-------------|-----------------------------|
| buildDirectoryTree        | dir: string, basePath: string = '', isSrc: boolean = false | any[] | Recursively builds a tree structure of the project's directories and markdown files. |
| generateMarkdownFromTree  | tree: any, depth: number = 0 | string | Generates markdown content from the directory tree structure. |
| generateDocsReadme        | -                            | void | Generates a README.md file in the docs directory with links to all generated documentation. |
| findTSFiles               | dir: string, fileList: string[] = [] | string[] | Recursively finds all TypeScript files in the project, excluding declaration files and index.ts. |
| generateChecksum          | content: string              | string | Generates a SHA-256 checksum for the given content. |
| generateDocumentation     | fileList: string[]          | Promise<void> | Generates markdown documentation for each TypeScript file in the fileList, if the file has changed since the last generation. |
| main                      | -                            | Promise<void> | The main function that orchestrates the documentation generation process. |

## Examples

```
// Example usage of API
{ PolicySynthExpressJSDocumentation } from '@policysynth/api/tools/generateDocumentation.js';

// Assuming an environment setup with the necessary directories and an OpenAI API key
main().then(() => console.log('Documentation generation complete.'));
```