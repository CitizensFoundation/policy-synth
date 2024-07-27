import { Queue } from "bullmq";
import { Redis } from "ioredis";
export declare class AgentQueueManager {
    redisClient: Redis;
    queues: Map<string, Queue>;
    constructor();
    initializeRedis(): void;
    getQueue(queueName: string): Queue;
    controlAgent(agentId: number, action: string): Promise<string>;
    startAgentProcessing(agentId: number): Promise<boolean>;
    pauseAgentProcessing(agentId: number): Promise<boolean>;
    getAgentStatus(agentId: number): Promise<PsAgentStatus | null>;
    updateAgentStatus(agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any>): Promise<boolean>;
}
//# sourceMappingURL=agentQueueManager.d.ts.map