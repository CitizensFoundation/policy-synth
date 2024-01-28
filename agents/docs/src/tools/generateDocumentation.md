# PolicySynthAgentBase

This class serves as the base for policy synthesis agents.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| openaiClient  | OpenAI | The OpenAI client instance used for generating completions. |
| rootDir       | string | The root directory of the project. |
| docsDir       | string | The directory where documentation files are stored. |
| checksumDir   | string | The directory where checksum files for documentation are stored. |

## Methods

| Name                  | Parameters                        | Return Type | Description                 |
|-----------------------|-----------------------------------|-------------|-----------------------------|
| buildDirectoryTree    | dir: string, basePath: string = '', isSrc: boolean = false | any[] | Builds a tree structure of the directory for documentation. |
| generateMarkdownFromTree | tree: any, depth: number = 0, basePath: string = 'src/' | string | Generates markdown documentation from the directory tree. |
| generateDocsReadme    |                                   | void        | Generates the README.md file for the documentation directory. |
| findTSFiles           | dir: string, fileList: string[] = [] | string[]    | Finds all TypeScript files in the given directory, excluding certain files and directories. |
| generateChecksum      | content: string                    | string      | Generates a SHA256 checksum for the given content. |
| generateDocumentation | fileList: string[]                 | Promise<void> | Generates documentation for each TypeScript file in the list. |
| main                  |                                   | Promise<void> | The main function to run the documentation generation process. |

## Example

```typescript
// Example usage of PolicySynthAgentBase
import { PolicySynthAgentBase } from '@policysynth/agents/tools/generateDocumentation.js';

const agentBase = new PolicySynthAgentBase();
agentBase.main().then(() => console.log('Documentation generation complete.'));
```