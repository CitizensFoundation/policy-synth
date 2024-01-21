The provided TypeScript code is a script for generating API documentation for TypeScript files in a project. It uses the OpenAI API to generate the documentation content. Below is the API documentation for the script itself, formatted in the requested Markdown format.

# OpenAI Documentation Generator Script

This script generates API documentation for TypeScript files in a project using the OpenAI API.

## Properties

No properties are documented in the script.

## Methods

| Name                  | Parameters | Return Type | Description |
|-----------------------|------------|-------------|-------------|
| buildDirectoryTree    | dir: string, basePath: string = '', isSrc: boolean = false | any[] | Builds a tree structure of the directory contents, excluding certain files and directories. |
| generateMarkdownFromTree | tree: any, depth: number = 0 | string | Generates markdown text from the directory tree structure. |
| generateDocsReadme    | None       | void        | Generates a README.md file in the docs directory with a markdown representation of the directory tree. |
| findTSFiles           | dir: string, fileList: string[] = [] | string[] | Recursively finds all TypeScript files in a directory, excluding certain files and directories. |
| generateChecksum      | content: string | string | Generates a SHA-256 checksum for the given content. |
| generateDocumentation | fileList: string[], systemPrompt: string | Promise<void> | Generates documentation for each TypeScript file in the fileList using the OpenAI API. |
| main                  | None       | Promise<void> | The main function that finds TypeScript files, generates the docs README, and generates documentation for each file. |

## Events

No events are documented in the script.

## Examples

```typescript
// Example usage of the script is not provided as it is intended to be run as a standalone process.
```

Please note that the script does not contain explicit examples, properties, or events within the code. The methods are derived from the functions defined in the script, and the descriptions are based on the comments and the code's functionality.