# RedisMemoryRetriever

This module retrieves memory data from a Redis database and parses it into a structured format.

## Properties

No properties are defined in this module.

## Methods

No methods are defined in this module.

## Example

```typescript
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const output = await redis.get("st_mem:1:id");

const memory = JSON.parse(output!) as PsBaseMemoryData;

console.log("output", JSON.stringify(memory, null, 2));

process.exit(0);
```
