# RedisMemoryManager

This class is responsible for managing memory data in a Redis database, particularly for adding custom search URLs to a project's memory data.

## Properties

No properties are documented for this class.

## Methods

| Name           | Parameters        | Return Type | Description                                                                 |
|----------------|-------------------|-------------|-----------------------------------------------------------------------------|
| addCustomUrls  |                   | Promise<void> | Adds custom search URLs to the memory data of a given project in Redis. |

## Examples

```typescript
import ioredis from 'ioredis';

// Initialize RedisMemoryManager with a Redis connection string
const redisMemoryManager = new RedisMemoryManager('redis://localhost:6379');

// Example usage of adding custom URLs
const projectId = 'exampleProjectId';
redisMemoryManager.addCustomUrls(projectId).then(() => {
  console.log('Custom search URLs added successfully.');
}).catch(console.error);
```

**Note:** The example assumes the existence of a `RedisMemoryManager` class with a constructor accepting a Redis connection string and a method `addCustomUrls(projectId)`. The actual implementation may differ based on the context and usage within the provided code snippet.