# Redis Client

This module provides a shared Redis client instance using the `ioredis` library. It connects to a Redis server using a URL specified in environment variables or defaults to a local Redis server.

## Properties

| Name                | Type   | Description                                                                 |
|---------------------|--------|-----------------------------------------------------------------------------|
| sharedRedisClient   | Redis  | An instance of the Redis client connected to the specified Redis server URL.|

## Example

```typescript
import sharedRedisClient from '@policysynth/agents/base/redisClient.js';

// Example usage of sharedRedisClient
sharedRedisClient.set('key', 'value');
sharedRedisClient.get('key', (err, result) => {
  if (err) {
    console.error('Error fetching key:', err);
  } else {
    console.log('Value:', result);
  }
});
```

In this example, the `sharedRedisClient` is used to set and get a key-value pair in the Redis database. The client connects to the Redis server using the URL specified in the `REDIS_AGENT_URL` or `REDIS_URL` environment variables, or defaults to `redis://localhost:6379` if neither is set.