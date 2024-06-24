import { PsAgent } from '../models/index.js';
export declare class AgentManagerService {
    private redisClient;
    private queues;
    constructor();
    private initializeRedis;
    private getQueue;
    createAgent(agentData: any): Promise<PsAgent>;
    getAgent(agentId: number): Promise<PsAgent | null>;
    updateAgent(agentId: number, updateData: any): Promise<PsAgent | null>;
    deleteAgent(agentId: number): Promise<boolean>;
    startAgentProcessing(agentId: number): Promise<boolean>;
    pauseAgentProcessing(agentId: number): Promise<boolean>;
    createTask(agentId: number, taskData: any): Promise<string>;
    getAgentStatus(agentId: number): Promise<PsAgentStatus | null>;
    updateAgentStatus(agentId: number, state: PsAgentStatus['state'], progress?: number, message?: string, details?: Record<string, any>): Promise<boolean>;
    private setupAgentMemory;
    private deleteAgentMemory;
}
//# sourceMappingURL=agentManager.d.ts.map