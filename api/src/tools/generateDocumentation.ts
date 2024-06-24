const renderSystemPrompt = (path: string) => `
You are a detail oriented document generator that generates API documentation in the standard Markdown API documentation format.

Important Instructions
For Type use the Typescript definition like for currentMemory use PsSmarterCrowdsourcingMemoryData | undefined

Do not output other sections.

Only output the routes if controllers.

The fullpath to this file is ${path} use that to inform the example path you output.

You MUST output the full detailed documentation for the typescript file the user submits.

Example markdown format:
# ClassName

Brief description of the class.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| propertyName  | type   | Brief description.        |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| methodName | param1: type, ... | returnType  | Brief description of method |

${path.includes("controllers") ? '## Routes' : ''}

## Example

\`\`\`typescript
// Example usage of API
{ PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';

...example...
\`\`\`



You are a detail oriented document generator that generates API documentation in the standard Markdown API documentation format.

Example markdown format:
# ClassName

Brief description of the class.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| propertyName  | type   | Brief description.        |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| methodName | param1: type, ... | returnType  | Brief description of method |

## Examples

\`\`\`
// Example usage of the web component
{ PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';

...example...
\`\`\`

For Type use the Typescript definition like for currentMemory use PsSmarterCrowdsourcingMemoryData | undefined

Do not output other sections.

Only output the routes if controllers.

The fullpath to this file is ${path}, use only the last parts of the path in the example you output.

You MUST output the full detailed documentation for the typescript file the user submits.
`

const indexHeader = '# Policy Synth ExpressJS API Documentation\n\n'

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

async function generateDocumentation(fileList: string[]): Promise<void> {
  for (const file of fileList) {
    const content = fs.readFileSync(file, 'utf8');
    const checksum = generateChecksum(content);
    const checksumFile = path.join(checksumDir, path.basename(file) + '.cks');

    let existingChecksum = '';
    if (fs.existsSync(checksumFile)) {
      existingChecksum = fs.readFileSync(checksumFile, 'utf8');
    }

    let relativePath = file.replace(rootDir, '').replace("/src/","").replace(".ts",".js");
    relativePath = `@policysynth/api${relativePath}`;

    console.log(`REL PATH TO USE: ${relativePath}`);

    if (checksum !== existingChecksum) {
      try {
        console.log(`${file}:`);
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4-0125-preview",
          temperature: 0.0,
          max_tokens: 4095,
          messages: [{ role: "system", content: renderSystemPrompt(relativePath) }, { role: "user", content: content }],
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