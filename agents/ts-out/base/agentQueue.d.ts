import ioredis from "ioredis";
import { PolicySynthAgent } from "./agent.js";
import { PsAgent } from "../dbModels/agent.js";
export interface PsAgentStartJobData {
    agentId: number;
    action: "start" | "stop" | "pause";
    structuredAnswersOverrides?: Array<any>;
}
/**
 * Abstract queue that can hold multiple agent implementations
 * This class has been refactored to store multiple Agents in maps
 */
export declare abstract class PolicySynthAgentQueue extends PolicySynthAgent {
    protected agentsMap: Map<number, PsAgent>;
    protected agentInstancesMap: Map<number, PolicySynthAgent>;
    protected agentStatusMap: Map<number, PsAgentStatus>;
    protected agentMemoryMap: Map<number, PsAgentMemoryData>;
    structuredAnswersOverrides?: Array<any>;
    skipCheckForProgress: boolean;
    redisClient: ioredis;
    constructor();
    abstract get processors(): Array<{
        processor: new (agent: PsAgent, memory: any, startProgress: number, endProgress: number) => PolicySynthAgent;
        weight: number;
    }>;
    abstract get agentQueueName(): string;
    abstract setupMemoryIfNeeded(agentId: number): Promise<void>;
    initializeRedis(): void;
    getOrCreatePsAgent(agentId: number): Promise<PsAgent>;
    /**
     * Retrieve or create the actual PolicySynthAgent instance.
     * Now we pass the memory from agentMemoryMap to the constructor,
     * so we always have an object with structuredAnswersOverrides set.
     */
    getOrCreateAgentInstance(agentId: number): PolicySynthAgent;
    processAllAgents(agentId: number): Promise<void>;
    loadAgentStatusFromRedis(agentId: number): Promise<PsAgentStatus | undefined>;
    saveAgentStatusToRedis(agentId: number): Promise<void>;
    setupStatusIfNeeded(agentId: number): Promise<void>;
    setupAgentQueue(): Promise<void>;
    startAgent(agentId: number): Promise<void>;
    stopAgent(agentId: number): Promise<void>;
    pauseAgent(agentId: number): Promise<void>;
    updateAgentStatus(agentId: number, state: "running" | "stopped" | "paused" | "error", message?: string): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map