export declare class AgentQueueManager {
    private redisClient;
    private queues;
    constructor();
    private initializeRedis;
    private getQueue;
    controlAgent(agentId: number, action: string): Promise<string>;
    startAgentProcessing(agentId: number): Promise<boolean>;
    pauseAgentProcessing(agentId: number): Promise<boolean>;
    getAgentStatus(agentId: number): Promise<PsAgentStatus | null>;
    updateAgentStatus(agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any>): Promise<boolean>;
    private setupAgentMemory;
    private deleteAgentMemory;
}
//# sourceMappingURL=agentQueueManager.d.ts.map