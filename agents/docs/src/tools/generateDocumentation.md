# Documentation Generator

This script is designed to generate API documentation in Markdown format for TypeScript files within a project. It uses OpenAI's GPT-4 model to generate detailed documentation based on the content of the TypeScript files and predefined type definitions.

## Overview

The script performs the following tasks:
1. **Build Directory Tree**: Constructs a directory tree of the project, excluding certain files and directories.
2. **Generate Markdown from Tree**: Converts the directory tree into a Markdown format for the documentation index.
3. **Find TypeScript Files**: Recursively searches for TypeScript files in the project directory.
4. **Generate Checksums**: Creates checksums for file contents to detect changes.
5. **Get All Type Definitions**: Reads all type definition files (`.d.ts`) and combines their contents.
6. **Generate Documentation**: Uses OpenAI's GPT-4 model to generate documentation for each TypeScript file if changes are detected.
7. **Generate Documentation Index**: Creates a `README.md` file in the `docs` directory with links to all generated documentation files.

## Configuration

- **OpenAI API Key**: The script requires an OpenAI API key, which should be set in the environment variable `OPENAI_API_KEY`.
- **Directories**: The script assumes the project has a `src` directory for source files and a `docs` directory for documentation.

## Example Usage

```typescript
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { OpenAI } from 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const rootDir = process.cwd();
const docsDir = path.join(rootDir, 'docs');
const checksumDir = path.join(docsDir, 'cks');

// Ensure the docs and checksum directories exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
if (!fs.existsSync(checksumDir)) {
  fs.mkdirSync(checksumDir, { recursive: true });
}

function buildDirectoryTree(dir: string, basePath = '', isSrc = false) {
  let structure: any[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
      if (entry.name === 'cks' || entry.name === 'README.md' || entry.name.endsWith('.d.ts') || entry.name.startsWith('.')) {
          return; // skip cks directory, TypeScript declaration files, and hidden files
      }

      const relativePath = isSrc ? entry.name : path.join(basePath, entry.name);

      if (entry.isDirectory()) {
          // Flatten the 'src' directory into the top level
          const children = buildDirectoryTree(path.join(dir, entry.name), relativePath, isSrc || entry.name === 'src');
          if (entry.name === 'src') {
              structure = structure.concat(children);
          } else {
              structure.push({
                  type: 'directory',
                  name: entry.name,
                  path: relativePath,
                  children: children
              });
          }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
          structure.push({
              type: 'file',
              name: entry.name,
              path: relativePath
          });
      }
  });

  return structure;
}

function generateMarkdownFromTree(tree: any, depth = 0, basePath = 'src/') {
  let markdown = '';
  const indent = '  '.repeat(depth);

  tree.forEach((item: any) => {
      if (item.type === 'directory') {
          markdown += `${indent}- ${item.name}\n`;
          // Append the directory name to the basePath for subdirectories
          const newBasePath = depth === 0 ? `${item.name}/` : `${basePath}${item.name}/`;
          markdown += generateMarkdownFromTree(item.children, depth + 1, newBasePath);
      } else if (item.type === 'file') {
          // Prepend 'src/' to the basePath for files at the root, and adjust for subdirectories
          const relativePath = `src/${basePath}${item.path}`;
          markdown += `${indent}- [${item.name.replace('.md', '')}](${relativePath})\n`;
      }
  });

  return markdown;
}

function generateDocsReadme() {
  const tree = buildDirectoryTree(docsDir);
  console.log(JSON.stringify(tree, null, 2));
  const markdown = generateMarkdownFromTree(tree);
  fs.writeFileSync(path.join(docsDir, 'README.md'), `${indexHeader}${markdown}`);
}

function findTSFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.endsWith('.d.ts')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTSFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getAllTypeDefContents(rootDir: string): string {
  const typeDefFiles = glob.sync(path.join(rootDir, 'src', '**', '*.d.ts'));
  return typeDefFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n\n');
}

async function generateDocumentation(fileList: string[]): Promise<void> {
  const allTypedefContents = getAllTypeDefContents(rootDir);
  console.log(`AllTypeDefs: ${allTypedefContents}`);
  for (const file of fileList) {
    const content = fs.readFileSync(file, 'utf8');
    const checksum = generateChecksum(content);
    const checksumFile = path.join(checksumDir, path.basename(file) + '.cks');

    let existingChecksum = '';
    if (fs.existsSync(checksumFile)) {
      existingChecksum = fs.readFileSync(checksumFile, 'utf8');
    }

    let relativePath = file.replace(rootDir, '').replace("/src/","").replace(".ts",".js");
    relativePath = `@policysynth/agents/${relativePath}`;

    console.log(`REL: ${relativePath}`);

    if (checksum !== existingChecksum) {
      try {
        console.log(`${file}:`);
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.0,
          max_tokens: 4095,
          messages: [{ role: "system", content: renderSystemPrompt(relativePath, allTypedefContents) }, { role: "user", content: content }],
        });

        let docContent = completion.choices[0].message.content;

        console.log(docContent);
        docContent = docContent!.replace(/```markdown\s+/g, '');

        const docFilePath = file.replace(rootDir, docsDir).replace('.ts', '.md');
        const docDirPath = path.dirname(docFilePath);

        if (!fs.existsSync(docDirPath)) {
          fs.mkdirSync(docDirPath, { recursive: true });
        }

        fs.writeFileSync(docFilePath, docContent);
        fs.writeFileSync(checksumFile, checksum); // Save the new checksum
        console.log(`Documentation generated for ${file}`);
      } catch (error) {
        console.error(`Error generating documentation for ${file}:`, error);
        process.exit(1);
      }
    } else {
      console.log(`Skipping documentation generation for ${file}, no changes detected.`);
    }
  }
}

async function main(): Promise<void> {
  const tsFiles = findTSFiles(rootDir);
  generateDocsReadme();
  await generateDocumentation(tsFiles);
  generateDocsReadme();
}

main().then(() => console.log('Documentation generation complete.'));
```

## Functions

### `buildDirectoryTree`

Builds a directory tree structure, excluding certain files and directories.

**Parameters:**
- `dir: string`: The directory to build the tree from.
- `basePath: string`: The base path for the directory.
- `isSrc: boolean`: Whether the directory is the source directory.

**Returns:**
- `any[]`: The directory tree structure.

### `generateMarkdownFromTree`

Generates Markdown from the directory tree structure.

**Parameters:**
- `tree: any[]`: The directory tree structure.
- `depth: number`: The depth of the tree.
- `basePath: string`: The base path for the directory.

**Returns:**
- `string`: The generated Markdown.

### `generateDocsReadme`

Generates the `README.md` file in the `docs` directory with links to all generated documentation files.

### `findTSFiles`

Recursively searches for TypeScript files in the project directory.

**Parameters:**
- `dir: string`: The directory to search for TypeScript files.
- `fileList: string[]`: The list of TypeScript files.

**Returns:**
- `string[]`: The list of TypeScript files.

### `generateChecksum`

Generates a checksum for the given content.

**Parameters:**
- `content: string`: The content to generate a checksum for.

**Returns:**
- `string`: The generated checksum.

### `getAllTypeDefContents`

Reads all type definition files (`.d.ts`) and combines their contents.

**Parameters:**
- `rootDir: string`: The root directory of the project.

**Returns:**
- `string`: The combined contents of all type definition files.

### `generateDocumentation`

Generates documentation for each TypeScript file if changes are detected.

**Parameters:**
- `fileList: string[]`: The list of TypeScript files.

### `main`

The main function that orchestrates the documentation generation process.

## Example

```typescript
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { OpenAI } from 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const rootDir = process.cwd();
const docsDir = path.join(rootDir, 'docs');
const checksumDir = path.join(docsDir, 'cks');

// Ensure the docs and checksum directories exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
if (!fs.existsSync(checksumDir)) {
  fs.mkdirSync(checksumDir, { recursive: true });
}

function buildDirectoryTree(dir: string, basePath = '', isSrc = false) {
  let structure: any[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
      if (entry.name === 'cks' || entry.name === 'README.md' || entry.name.endsWith('.d.ts') || entry.name.startsWith('.')) {
          return; // skip cks directory, TypeScript declaration files, and hidden files
      }

      const relativePath = isSrc ? entry.name : path.join(basePath, entry.name);

      if (entry.isDirectory()) {
          // Flatten the 'src' directory into the top level
          const children = buildDirectoryTree(path.join(dir, entry.name), relativePath, isSrc || entry.name === 'src');
          if (entry.name === 'src') {
              structure = structure.concat(children);
          } else {
              structure.push({
                  type: 'directory',
                  name: entry.name,
                  path: relativePath,
                  children: children
              });
          }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
          structure.push({
              type: 'file',
              name: entry.name,
              path: relativePath
          });
      }
  });

  return structure;
}

function generateMarkdownFromTree(tree: any, depth = 0, basePath = 'src/') {
  let markdown = '';
  const indent = '  '.repeat(depth);

  tree.forEach((item: any) => {
      if (item.type === 'directory') {
          markdown += `${indent}- ${item.name}\n`;
          // Append the directory name to the basePath for subdirectories
          const newBasePath = depth === 0 ? `${item.name}/` : `${basePath}${item.name}/`;
          markdown += generateMarkdownFromTree(item.children, depth + 1, newBasePath);
      } else if (item.type === 'file') {
          // Prepend 'src/' to the basePath for files at the root, and adjust for subdirectories
          const relativePath = `src/${basePath}${item.path}`;
          markdown += `${indent}- [${item.name.replace('.md', '')}](${relativePath})\n`;
      }
  });

  return markdown;
}

function generateDocsReadme() {
  const tree = buildDirectoryTree(docsDir);
  console.log(JSON.stringify(tree, null, 2));
  const markdown = generateMarkdownFromTree(tree);
  fs.writeFileSync(path.join(docsDir, 'README.md'), `${indexHeader}${markdown}`);
}

function findTSFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.endsWith('.d.ts')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTSFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getAllTypeDefContents(rootDir: string): string {
  const typeDefFiles = glob.sync(path.join(rootDir, 'src', '**', '*.d.ts'));
  return typeDefFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n\n');
}

async function generateDocumentation(fileList: string[]): Promise<void> {
  const allTypedefContents = getAllTypeDefContents(rootDir);
  console.log(`AllTypeDefs: ${allTypedefContents}`);
  for (const file of fileList) {
    const content = fs.readFileSync(file, 'utf8');
    const checksum = generateChecksum(content);
    const checksumFile = path.join(checksumDir, path.basename(file) + '.cks');

    let existingChecksum = '';
    if (fs.existsSync(checksumFile)) {
      existingChecksum = fs.readFileSync(checksumFile, 'utf8');
    }

    let relativePath = file.replace(rootDir, '').replace("/src/","").replace(".ts",".js");
    relativePath = `@policysynth/agents/${relativePath}`;

    console.log(`REL: ${relativePath}`);

    if (checksum !== existingChecksum) {
      try {
        console.log(`${file}:`);
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.0,
          max_tokens: 4095,
          messages: [{ role: "system", content: renderSystemPrompt(relativePath, allTypedefContents) }, { role: "user", content: content }],
        });

        let docContent = completion.choices[0].message.content;

        console.log(docContent);
        docContent = docContent!.replace(/```markdown\s+/g, '');

        const docFilePath = file.replace(rootDir, docsDir).replace('.ts', '.md');
        const docDirPath = path.dirname(docFilePath);

        if (!fs.existsSync(docDirPath)) {
          fs.mkdirSync(docDirPath, { recursive: true });
        }

        fs.writeFileSync(docFilePath, docContent);
        fs.writeFileSync(checksumFile, checksum); // Save the new checksum
        console.log(`Documentation generated for ${file}`);
      } catch (error) {
        console.error(`Error generating documentation for ${file}:`, error);
        process.exit(1);
      }
    } else {
      console.log(`Skipping documentation generation for ${file}, no changes detected.`);
    }
  }
}

async function main(): Promise<void> {
  const tsFiles = findTSFiles(rootDir);
  generateDocsReadme();
  await generateDocumentation(tsFiles);
  generateDocsReadme();
}

main().then(() => console.log('Documentation generation complete.'));
```

## Conclusion

This script automates the process of generating API documentation for TypeScript projects using OpenAI's GPT-4 model. It ensures that the documentation is up-to-date by checking for changes in the source files and only regenerating documentation when necessary. The generated documentation is organized in a `docs` directory with a `README.md` file that provides an index of all documentation files.