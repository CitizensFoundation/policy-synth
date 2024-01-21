# FileSystemAPI

API for interacting with the file system.

## Properties

No properties.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| readFile   | filePath: string  | void        | Reads the content of the file at the given file path. |
| writeFile  | filePath: string, data: string, callback: (err: NodeJS.ErrnoException) => void | void | Writes data to the file, replacing the file if it already exists. |
| readFileSync | filePath: string, encoding: string | string | Reads the content of the file at the given file path synchronously. |
| writeFileSync | filePath: string, data: string | void | Writes data to the file synchronously, replacing the file if it already exists. |
| join       | ...paths: string[] | string     | Joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path. |
| isAbsolute | path: string      | boolean    | Determines whether path is an absolute path. |

## Examples

```typescript
import fs from "fs";
import path from "path";

// Example usage of reading a file synchronously
const filePath = path.join(process.cwd(), "currentMemory.json");
const memoryData = fs.readFileSync(filePath, "utf-8");

// Example usage of writing to a file asynchronously
fs.writeFile("/tmp/pros_cons.html", "<html>...</html>", (err) => {
  if (err) throw err;
  console.log("HTML file has been saved!");
});
```

# ProcessAPI

API for interacting with the process object in Node.js.

## Properties

No properties.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| exit       | code?: number     | void        | Ends the process with the specified code. If omitted, exit uses the 'success' code 0. |

## Examples

```typescript
import process from "process";

// Example usage of process.exit
process.exit(0); // Exits the process with a 'success' code
```

# IEngineConstants

Interface representing engine constants.

## Properties

| Name              | Type   | Description               |
|-------------------|--------|---------------------------|
| maxSubProblems    | number | Maximum number of subproblems to process. |

## Methods

No methods.

## Examples

```typescript
// Example usage of IEngineConstants
import { IEngineConstants } from "../../../../constants.js";

console.log(IEngineConstants.maxSubProblems);
```

(Note: The provided code does not define a class or a method directly, but rather shows usage of Node.js modules and an interface. The documentation above is structured to fit the example code into the requested Markdown API documentation format, even though the code does not define a typical API with classes and methods.)