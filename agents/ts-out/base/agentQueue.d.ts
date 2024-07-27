import { Redis } from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthAgent } from "./agent.js";
export declare abstract class PolicySynthAgentQueue extends PolicySynthAgent {
    status: PsAgentStatus;
    redisClient: Redis;
    skipCheckForProgress: boolean;
    constructor();
    initializeRedis(): void;
    loadAgentStatusFromRedis(): Promise<PsAgentStatus>;
    saveAgentStatusToRedis(): Promise<void>;
    setupStatusIfNeeded(): Promise<void>;
    abstract get processors(): Array<{
        processor: new (agent: PsAgent, memory: any, //TODO: Fix this to T or something
        startProgress: number, endProgress: number) => PolicySynthAgent;
        weight: number;
    }>;
    processAllAgents(): Promise<void>;
    abstract get agentQueueName(): string;
    abstract setupMemoryIfNeeded(): Promise<void>;
    setupAgentQueue(): Promise<void>;
    startAgent(): Promise<void>;
    stopAgent(): Promise<void>;
    pauseAgent(): Promise<void>;
    updateAgentStatus(state: "running" | "stopped" | "paused" | "error", message?: string): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map