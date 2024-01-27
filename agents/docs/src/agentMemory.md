# PsAgentMemory

Abstract class for agent memory storage.

## Methods

| Name | Parameters            | Return Type     | Description                           |
|------|-----------------------|-----------------|---------------------------------------|
| set  | key: string, value: any | Promise<void> | Abstract method to set a value by key. |
| get  | key: string           | Promise<any>   | Abstract method to get a value by key. |

# RedisAgentMemory

Implements PsAgentMemory using Redis for storage.

## Properties

| Name  | Type | Description          |
|-------|------|----------------------|
| redis | any  | Redis client instance. |

## Methods

| Name | Parameters            | Return Type     | Description                           |
|------|-----------------------|-----------------|---------------------------------------|
| set  | key: string, value: any | Promise<void> | Sets a value by key in Redis.         |
| get  | key: string           | Promise<any>   | Gets a value by key from Redis.       |

## Example

```
import Redis from "ioredis";
import { RedisAgentMemory } from '@policysynth/agents/agentMemory.js';

const redis = new Redis();
const agentMemory = new RedisAgentMemory(redis);

await agentMemory.set("key", { data: "value" });
const value = await agentMemory.get("key");
```

# PostgresAgentMemory

Implements PsAgentMemory using PostgreSQL for storage.

## Properties

| Name       | Type        | Description                        |
|------------|-------------|------------------------------------|
| client     | PoolClient  | PostgreSQL client instance.        |
| tableName  | string      | Name of the table for storing data.|

## Methods

| Name | Parameters            | Return Type     | Description                               |
|------|-----------------------|-----------------|-------------------------------------------|
| set  | key: string, value: any | Promise<void> | Sets a value by key in PostgreSQL.        |
| get  | key: string           | Promise<any>   | Gets a value by key from PostgreSQL.      |

## Example

```
import { Pool } from 'pg';
import { PostgresAgentMemory } from '@policysynth/agents/agentMemory.js';

const pool = new Pool();
const client = await pool.connect();
const agentMemory = new PostgresAgentMemory(client);

await agentMemory.set("key", { data: "value" });
const value = await agentMemory.get("key");
```