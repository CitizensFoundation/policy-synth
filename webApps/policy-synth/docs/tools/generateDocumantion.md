# OpenAI

The `OpenAI` class is responsible for interacting with the OpenAI API using the provided API key.

## Properties

| Name      | Type   | Description               |
|-----------|--------|---------------------------|
| apiKey    | string | The API key for OpenAI.   |

## Methods

| Name            | Parameters                  | Return Type | Description                                 |
|-----------------|-----------------------------|-------------|---------------------------------------------|
| constructor     | options: { apiKey: string } | OpenAI      | Initializes a new instance of the OpenAI class with the provided API key. |
| chat.completions.create | options: { model: string, temperature: number, max_tokens: number, messages: { role: string, content: string }[] } | Promise<any> | Sends a request to the OpenAI API to create a chat completion based on the provided options. |

## Examples

```typescript
import { OpenAI } from 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getCompletion(prompt: string) {
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4-1106-preview",
    temperature: 0.0,
    max_tokens: 4095,
    messages: [{ role: "system", content: prompt }],
  });
  return completion;
}
```

# FileSystem

The `FileSystem` module provides an API for interacting with the file system.

## Methods

| Name            | Parameters                  | Return Type | Description                                 |
|-----------------|-----------------------------|-------------|---------------------------------------------|
| existsSync      | path: string                | boolean     | Checks if the path exists in the file system. |
| mkdirSync       | path: string, options: { recursive: boolean } | void | Synchronously creates a directory at the specified path. |
| readdirSync     | path: string, options: { withFileTypes: boolean } | string[] \| fs.Dirent[] | Reads the contents of a directory. |
| readFileSync    | path: string, encoding: string | string | Reads the contents of a file and returns it as a string. |
| writeFileSync   | file: string, data: string | void | Writes data to a file, replacing the file if it already exists. |

## Examples

```typescript
import * as fs from 'fs';

// Check if a directory exists
if (!fs.existsSync('/path/to/directory')) {
  // Create the directory
  fs.mkdirSync('/path/to/directory', { recursive: true });
}

// Read all files in a directory
const files = fs.readdirSync('/path/to/directory');

// Read the contents of a file
const content = fs.readFileSync('/path/to/file.txt', 'utf8');

// Write to a file
fs.writeFileSync('/path/to/output.txt', 'Hello, World!');
```

# Path

The `Path` module provides utilities for working with file and directory paths.

## Methods

| Name            | Parameters                  | Return Type | Description                                 |
|-----------------|-----------------------------|-------------|---------------------------------------------|
| join            | ...paths: string[]          | string      | Joins all given path segments together.     |
| basename        | path: string, ext?: string  | string      | Returns the last portion of a path.         |
| dirname         | path: string                | string      | Returns the directory name of a path.       |

## Examples

```typescript
import * as path from 'path';

// Join multiple segments into one path
const fullPath = path.join('/path', 'to', 'directory');

// Get the base name of a file
const fileName = path.basename('/path/to/file.txt');

// Get the directory name from a path
const dirName = path.dirname('/path/to/directory/file.txt');
```

# Crypto

The `Crypto` module provides cryptographic functionality.

## Methods

| Name            | Parameters                  | Return Type | Description                                 |
|-----------------|-----------------------------|-------------|---------------------------------------------|
| createHash      | algorithm: string           | crypto.Hash | Creates and returns a Hash object that can be used to generate hash digests. |

## Examples

```typescript
import * as crypto from 'crypto';

// Create a SHA-256 hash of a string
const hash = crypto.createHash('sha256').update('some data').digest('hex');
```

Please note that the above documentation is a simplified version and does not cover all methods and properties of the modules. For comprehensive documentation, refer to the official Node.js API documentation.