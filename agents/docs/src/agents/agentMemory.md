# PsAgentMemory

Abstract class representing a generic agent memory storage.

## Methods

| Name       | Parameters        | Return Type      | Description                                     |
|------------|-------------------|------------------|-------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Abstract method to store a value with a key.   |
| get        | key: string       | Promise<any>     | Abstract method to retrieve a value by its key. |

# RedisAgentMemory

Implements the PsAgentMemory class using Redis for storage.

## Properties

| Name       | Type | Description               |
|------------|------|---------------------------|
| redis      | any  | Instance of Redis client. |

## Methods

| Name       | Parameters        | Return Type      | Description                                     |
|------------|-------------------|------------------|-------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Stores a value with a key in Redis.            |
| get        | key: string       | Promise<any>     | Retrieves a value by its key from Redis.        |

## Examples

```typescript
// Example usage of RedisAgentMemory
const redis = new Redis();
const memory = new RedisAgentMemory(redis);

await memory.set('key', { data: 'value' });
const value = await memory.get('key');
```

# PostgresAgentMemory

Implements the PsAgentMemory class using PostgreSQL for storage.

## Properties

| Name       | Type        | Description                        |
|------------|-------------|------------------------------------|
| client     | PoolClient  | Instance of PostgreSQL client.     |
| tableName  | string      | Name of the table for storing data.|

## Methods

| Name       | Parameters        | Return Type      | Description                                     |
|------------|-------------------|------------------|-------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Stores a value with a key in PostgreSQL.       |
| get        | key: string       | Promise<any>     | Retrieves a value by its key from PostgreSQL.   |

## Examples

```typescript
// Example usage of PostgresAgentMemory
const { Pool } = require('pg');
const pool = new Pool();
const client = await pool.connect();
const memory = new PostgresAgentMemory(client);

await memory.set('key', { data: 'value' });
const value = await memory.get('key');
client.release();
```
