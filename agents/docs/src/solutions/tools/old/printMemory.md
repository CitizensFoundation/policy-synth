# RedisMemoryManager

This class demonstrates how to interact with Redis to retrieve and parse memory data.

## Properties

No properties are defined in this example.

## Methods

No methods are defined in this example.

## Example

```typescript
import ioredis from "ioredis";

// Initialize Redis client
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

// Asynchronously retrieve memory data from Redis
const output = await redis.get("st_mem:1:id");

// Parse the retrieved JSON string into PsBaseMemoryData type
const memory: PsBaseMemoryData | undefined = JSON.parse(output!);

// Log the parsed memory data
console.log("output", JSON.stringify(memory, null, 2));

// Exit the process
process.exit(0);
```

Note: This example assumes the existence of a `PsBaseMemoryData` type, which is not defined in the provided code snippet. Ensure to define or import this type appropriately in your actual implementation.