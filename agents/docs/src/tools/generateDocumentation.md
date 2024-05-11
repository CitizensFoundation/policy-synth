# PolicySynthAgentBase

This class serves as the base for policy synthesis agents, providing common functionalities and properties that are essential for policy management and synthesis.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| openaiClient  | OpenAI | Instance of OpenAI client used for generating completions. |
| rootDir       | string | The root directory of the project. |
| docsDir       | string | Directory path where documentation files are stored. |
| checksumDir   | string | Directory path where checksum files are stored to track changes. |

## Methods

| Name                  | Parameters                        | Return Type | Description                 |
|-----------------------|-----------------------------------|-------------|-----------------------------|
| buildDirectoryTree    | dir: string, basePath: string, isSrc: boolean | any[]       | Builds a tree structure of the directory for documentation purposes. |
| generateMarkdownFromTree | tree: any, depth: number, basePath: string | string      | Generates markdown documentation from the directory tree. |
| generateDocsReadme    |                                   | void        | Generates a README.md file in the docs directory with the documentation structure. |
| findTSFiles           | dir: string, fileList: string[]   | string[]    | Recursively finds all TypeScript files in a directory that are not declaration files or index files. |
| generateChecksum      | content: string                   | string      | Generates a SHA-256 checksum for the given content. |
| generateDocumentation | fileList: string[]                | Promise<void> | Generates documentation for each TypeScript file in the list if there are changes. |
| main                  |                                   | Promise<void> | Main function to execute the documentation generation process. |

## Example

```typescript
// Example usage of PolicySynthAgentBase
import { PolicySynthAgentBase } from '@policysynth/agents/tools/generateDocumentation.js';

const agentBase = new PolicySynthAgentBase();
agentBase.generateDocsReadme(); // Generates the initial README for documentation
```
