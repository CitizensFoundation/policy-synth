import Redis from "ioredis";
import { PoolClient } from 'pg';

abstract class PsAgentMemory {
  abstract set(key: string, value: any): Promise<void>;
  abstract get(key: string): Promise<any>;
}

export class RedisAgentMemory extends PsAgentMemory {
  private redis: any;

  constructor(redis: any) {
    super();
    this.redis = redis;
  }

  async set(key: string, value: any): Promise<void> {
    await this.redis.set(key, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
}

export class PostgresAgentMemory extends PsAgentMemory {
  private client: PoolClient;
  private tableName: string;

  constructor(client: PoolClient, tableName = "ps_agent_memory") {
    super();
    this.client = client;
    this.tableName = tableName;
  }

  async set(key: string, value: any): Promise<void> {
    const upsertQuery = `
      INSERT INTO ${this.tableName} (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value;
    `;
    await this.client.query(upsertQuery, [key, JSON.stringify(value)]);
  }

  async get(key: string): Promise<any> {
    const selectQuery = `SELECT value FROM ${this.tableName} WHERE key = $1;`;
    const res = await this.client.query(selectQuery, [key]);

    return res.rows.length > 0 ? JSON.parse(res.rows[0].value) : null;
  }
}
