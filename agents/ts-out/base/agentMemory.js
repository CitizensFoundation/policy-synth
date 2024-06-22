class PsAgentMemory {
}
export class RedisAgentMemory extends PsAgentMemory {
    redis;
    constructor(redis) {
        super();
        this.redis = redis;
    }
    async set(key, value) {
        await this.redis.set(key, JSON.stringify(value));
    }
    async get(key) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }
}
export class PostgresAgentMemory extends PsAgentMemory {
    client;
    tableName;
    constructor(client, tableName = "ps_agent_memory") {
        super();
        this.client = client;
        this.tableName = tableName;
    }
    async set(key, value) {
        const upsertQuery = `
      INSERT INTO ${this.tableName} (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value;
    `;
        await this.client.query(upsertQuery, [key, JSON.stringify(value)]);
    }
    async get(key) {
        const selectQuery = `SELECT value FROM ${this.tableName} WHERE key = $1;`;
        const res = await this.client.query(selectQuery, [key]);
        return res.rows.length > 0 ? JSON.parse(res.rows[0].value) : null;
    }
}
//# sourceMappingURL=agentMemory.js.map