import * as glob from "glob";
import * as realFs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { OpenAI } from "openai";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { isCliEntrypoint } from "./cliUtils.js";

type DocumentationTreeItem =
  | {
      type: "directory";
      name: string;
      path: string;
      children: DocumentationTreeItem[];
    }
  | {
      type: "file";
      name: string;
      path: string;
    };

type DocumentationFileSystem = Pick<
  typeof realFs,
  | "existsSync"
  | "mkdirSync"
  | "readdirSync"
  | "readFileSync"
  | "writeFileSync"
>;

type DocumentationOpenAiClient = {
  chat: {
    completions: {
      create(input: {
        model: string;
        temperature: number;
        max_tokens: number;
        messages: Array<{ role: "system" | "user"; content: string }>;
      }): Promise<{ choices: Array<{ message: { content: string | null } }> }>;
    };
  };
};

type ToolLogger = {
  info(...args: unknown[]): unknown;
  error(...args: unknown[]): unknown;
};

export interface DocumentationRuntime {
  rootDir: string;
  docsDir: string;
  checksumDir: string;
  fs: DocumentationFileSystem;
  globSync: (pattern: string) => string[];
  openaiClient: DocumentationOpenAiClient;
  logger: ToolLogger;
}

export const renderSystemPrompt = (filePath: string, allTypeDefsData: string) => `
You are a detail oriented document generator that generates API documentation in the standard Markdown API documentation format.

<AllTypeDefsUsedInProject>
${allTypeDefsData}
</AllTypeDefsUsedInProject>

<ImportantInstructions>
For Type use the Typescript definition like for currentMemory use PsBaseMemoryData | undefined

Always keep in mind the AllTypeDefsUsedInProject without referencing them too much directly, only when needed to clarify.

Do not output other sections.

Only output the routes if controllers.

The fullpath to this file is ${filePath.replace("/src", "")} use that to inform the example path you output.

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

## Example

\`\`\`typescript
// Example usage of agents
{ BaseProblemSolvingAgent } from '@policysynth/agents/baseProblemSolvingAgent.js';

...example...
\`\`\`
</ImportantInstructions>
`;

export const indexHeader = "# Policy Agents API Documentation\n\n";

export function createDocumentationRuntime(
  rootDir = process.cwd(),
  openaiClient: DocumentationOpenAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }) as DocumentationOpenAiClient
): DocumentationRuntime {
  const docsDir = path.join(rootDir, "docs");
  return {
    rootDir,
    docsDir,
    checksumDir: path.join(docsDir, "cks"),
    fs: realFs,
    globSync: glob.sync,
    openaiClient,
    logger: PolicySynthAgentBase.logger,
  };
}

export function ensureDocumentationDirs(runtime: DocumentationRuntime) {
  if (!runtime.fs.existsSync(runtime.docsDir)) {
    runtime.fs.mkdirSync(runtime.docsDir, { recursive: true });
  }
  if (!runtime.fs.existsSync(runtime.checksumDir)) {
    runtime.fs.mkdirSync(runtime.checksumDir, { recursive: true });
  }
}

export function buildDirectoryTree(
  dir: string,
  basePath = "",
  isSrc = false,
  fsModule: DocumentationFileSystem = realFs
): DocumentationTreeItem[] {
  let structure: DocumentationTreeItem[] = [];
  const entries = fsModule.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (
      entry.name === "cks" ||
      entry.name === "README.md" ||
      entry.name.endsWith(".d.ts") ||
      entry.name.startsWith(".")
    ) {
      return;
    }

    const relativePath = isSrc ? entry.name : path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = buildDirectoryTree(
        path.join(dir, entry.name),
        relativePath,
        isSrc || entry.name === "src",
        fsModule
      );
      if (entry.name === "src") {
        structure = structure.concat(children);
      } else {
        structure.push({
          type: "directory",
          name: entry.name,
          path: relativePath,
          children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      structure.push({
        type: "file",
        name: entry.name,
        path: relativePath,
      });
    }
  });

  return structure;
}

export function generateMarkdownFromTree(
  tree: DocumentationTreeItem[],
  depth = 0,
  basePath = "src/"
) {
  let markdown = "";
  const indent = "  ".repeat(depth);

  tree.forEach((item) => {
    if (item.type === "directory") {
      markdown += `${indent}- ${item.name}\n`;
      const newBasePath =
        depth === 0 ? `${item.name}/` : `${basePath}${item.name}/`;
      markdown += generateMarkdownFromTree(item.children, depth + 1, newBasePath);
    } else {
      const relativePath = `src/${basePath}${item.path}`.replace(
        /^src\/src\//,
        "src/"
      );
      markdown += `${indent}- [${item.name.replace(".md", "")}](${relativePath})\n`;
    }
  });

  return markdown;
}

export function generateDocsReadme(runtime = createDocumentationRuntime()) {
  ensureDocumentationDirs(runtime);
  const tree = buildDirectoryTree(runtime.docsDir, "", false, runtime.fs);
  runtime.logger.info(JSON.stringify(tree, null, 2));
  const markdown = generateMarkdownFromTree(tree);
  runtime.fs.writeFileSync(
    path.join(runtime.docsDir, "README.md"),
    `${indexHeader}${markdown}`
  );
}

export function findTSFiles(
  dir: string,
  fileList: string[] = [],
  fsModule: DocumentationFileSystem = realFs
): string[] {
  const entries = fsModule.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.endsWith(".d.ts")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTSFiles(fullPath, fileList, fsModule);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      entry.name !== "index.ts"
    ) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function generateChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function getAllTypeDefContents(runtime = createDocumentationRuntime()) {
  const typeDefFiles = runtime.globSync(
    path.join(runtime.rootDir, "src", "**", "*.d.ts")
  );
  return typeDefFiles
    .map((file) => runtime.fs.readFileSync(file, "utf8"))
    .join("\n\n");
}

export async function generateDocumentation(
  fileList: string[],
  runtime = createDocumentationRuntime()
): Promise<void> {
  ensureDocumentationDirs(runtime);
  const allTypedefContents = getAllTypeDefContents(runtime);
  runtime.logger.info(`AllTypeDefs: ${allTypedefContents}`);

  for (const file of fileList) {
    const content = runtime.fs.readFileSync(file, "utf8");
    const checksum = generateChecksum(content);
    const checksumFile = path.join(runtime.checksumDir, path.basename(file) + ".cks");

    let existingChecksum = "";
    if (runtime.fs.existsSync(checksumFile)) {
      existingChecksum = runtime.fs.readFileSync(checksumFile, "utf8");
    }

    let relativePath = file
      .replace(runtime.rootDir, "")
      .replace("/src/", "")
      .replace(".ts", ".js");
    relativePath = `@policysynth/agents/${relativePath}`;

    runtime.logger.info(`REL: ${relativePath}`);

    if (checksum !== existingChecksum) {
      try {
        runtime.logger.info(`${file}:`);
        const completion = await runtime.openaiClient.chat.completions.create({
          model: "gpt-4.1",
          temperature: 0.0,
          max_tokens: 8000,
          messages: [
            {
              role: "system",
              content: renderSystemPrompt(relativePath, allTypedefContents),
            },
            { role: "user", content },
          ],
        });

        const messageContent = completion.choices[0]?.message.content;
        if (!messageContent?.trim()) {
          throw new Error(`Documentation generation returned no content for ${file}`);
        }

        const docContent = messageContent.replace(/```markdown\s+/g, "");

        const docFilePath = file
          .replace(runtime.rootDir, runtime.docsDir)
          .replace(".ts", ".md");
        const docDirPath = path.dirname(docFilePath);

        if (!runtime.fs.existsSync(docDirPath)) {
          runtime.fs.mkdirSync(docDirPath, { recursive: true });
        }

        runtime.fs.writeFileSync(docFilePath, docContent);
        runtime.fs.writeFileSync(checksumFile, checksum);
        runtime.logger.info(`Documentation generated for ${file}`);
      } catch (error) {
        runtime.logger.error(`Error generating documentation for ${file}:`, error);
        process.exit(1);
      }
    } else {
      runtime.logger.info(
        `Skipping documentation generation for ${file}, no changes detected.`
      );
    }
  }
}

export async function main(runtime = createDocumentationRuntime()): Promise<void> {
  const tsFiles = findTSFiles(runtime.rootDir, [], runtime.fs);
  generateDocsReadme(runtime);
  await generateDocumentation(tsFiles, runtime);
  generateDocsReadme(runtime);
}

if (isCliEntrypoint(import.meta.url)) {
  await main().then(() =>
    PolicySynthAgentBase.logger.info("Documentation generation complete.")
  );
}
