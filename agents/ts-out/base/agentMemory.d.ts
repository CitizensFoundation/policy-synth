import { PoolClient } from 'pg';
declare abstract class PsAgentMemory {
    abstract set(key: string, value: any): Promise<void>;
    abstract get(key: string): Promise<any>;
}
export declare class RedisAgentMemory extends PsAgentMemory {
    private redis;
    constructor(redis: any);
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
}
export declare class PostgresAgentMemory extends PsAgentMemory {
    private client;
    private tableName;
    constructor(client: PoolClient, tableName?: string);
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
}
export {};
//# sourceMappingURL=agentMemory.d.ts.map