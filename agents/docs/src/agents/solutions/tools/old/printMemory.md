# ioredis

ioredis is a robust, performance-focused, and full-featured Redis client for Node.js.

## Properties

No public properties are documented for the ioredis instance.

## Methods

| Name  | Parameters                        | Return Type            | Description                                 |
|-------|-----------------------------------|------------------------|---------------------------------------------|
| get   | key: string                       | Promise<string \| null>| Gets the value of a key.                    |

## Examples

```typescript
import ioredis from "ioredis";

// Create a new Redis instance
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

// Use the get method to retrieve a value
const output = await redis.get("st_mem:1:id");

// Assuming the output is a JSON string, parse it into the IEngineInnovationMemoryData type
const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

// Log the parsed memory data
console.log("output", JSON.stringify(memory, null, 2));

// Exit the process
process.exit(0);
```

Please note that the `IEngineInnovationMemoryData` type is not defined in the provided code snippet. You would need to define this type or import it from the appropriate module where it is defined to use it in your TypeScript code.