# PsAgentMemory

Abstract class representing the memory storage mechanism for policy synthesis agents.

## Methods

| Name       | Parameters        | Return Type      | Description                                      |
|------------|-------------------|------------------|--------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Abstract method to set a value by key.          |
| get        | key: string       | Promise<any>     | Abstract method to get a value by key.          |

# RedisAgentMemory

Implements `PsAgentMemory` using Redis as the storage backend.

## Properties

| Name   | Type | Description               |
|--------|------|---------------------------|
| redis  | any  | Redis client instance.    |

## Methods

| Name       | Parameters        | Return Type      | Description                                      |
|------------|-------------------|------------------|--------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Sets a value in Redis by key.                    |
| get        | key: string       | Promise<any>     | Retrieves a value from Redis by key.             |

## Example

```
import Redis from "ioredis";
import { RedisAgentMemory } from '@policysynth/agents/agentMemory.ts';

const redis = new Redis();
const memory = new RedisAgentMemory(redis);

await memory.set("key", { data: "value" });
const value = await memory.get("key");
```

# PostgresAgentMemory

Implements `PsAgentMemory` using PostgreSQL as the storage backend.

## Properties

| Name       | Type         | Description                        |
|------------|--------------|------------------------------------|
| client     | PoolClient   | PostgreSQL client instance.        |
| tableName  | string       | Name of the table used for storage.|

## Methods

| Name       | Parameters        | Return Type      | Description                                      |
|------------|-------------------|------------------|--------------------------------------------------|
| set        | key: string, value: any | Promise<void> | Inserts or updates a value in PostgreSQL by key. |
| get        | key: string       | Promise<any>     | Retrieves a value from PostgreSQL by key.        |

## Example

```
import { Pool } from 'pg';
import { PostgresAgentMemory } from '@policysynth/agents/agentMemory.ts';

const pool = new Pool();
const client = await pool.connect();
const memory = new PostgresAgentMemory(client);

await memory.set("key", { data: "value" });
const value = await memory.get("key");

client.release();
```