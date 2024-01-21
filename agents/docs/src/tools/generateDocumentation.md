The provided TypeScript code is a script for generating API documentation for TypeScript files in a project. It uses the OpenAI API to generate the documentation based on the content of the TypeScript files. The script also manages checksums to avoid regenerating documentation for files that haven't changed. Below is the API documentation for the main class or module in the provided script, assuming it represents a TypeScript file.

# DocumentationGenerator

This class is responsible for generating API documentation for TypeScript files in a project. It uses the OpenAI API to create detailed documentation and manages checksums to detect changes in files.

## Properties

No public properties are defined in the script.

## Methods

| Name                  | Parameters        | Return Type | Description                                                                 |
|-----------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| buildDirectoryTree    | dir: string, basePath: string = '', isSrc: boolean = false | any[] | Recursively builds a tree structure representing the directory contents.    |
| generateMarkdownFromTree | tree: any, depth: number = 0 | string | Generates markdown text from the directory tree structure.                   |
| generateDocsReadme    | -                 | void        | Generates a README.md file in the docs directory with the documentation tree.|
| findTSFiles           | dir: string, fileList: string[] = [] | string[] | Recursively finds all TypeScript files in a directory, excluding certain files. |
| generateChecksum      | content: string   | string      | Generates a SHA256 checksum for the given content.                           |
| generateDocumentation | fileList: string[], systemPrompt: string | Promise<void> | Generates documentation for a list of TypeScript files using the OpenAI API. |
| main                  | -                 | Promise<void> | The main function that finds TypeScript files and generates documentation.   |

## Examples

```typescript
// Example usage of the DocumentationGenerator
const tsFiles = findTSFiles(rootDir);
await generateDocumentation(tsFiles, systemPromptWebApp);
generateDocsReadme();
```

Please note that the actual implementation details such as private methods, internal logic, and helper functions are not documented here as they are not part of the public API.