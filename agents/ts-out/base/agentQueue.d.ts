import ioredis from "ioredis";
import { Worker } from "bullmq";
import { PolicySynthAgent } from "./agent.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAgent } from "../dbModels/agent.js";
export interface PsAgentStartJobData {
    agentId: number;
    action: "start" | "stop" | "pause";
    structuredAnswersOverrides?: Array<any>;
}
export declare abstract class PolicySynthAgentQueue extends PolicySynthAgentBase {
    protected agentsMap: Map<number, PsAgent>;
    protected agentInstancesMap: Map<number, PolicySynthAgent>;
    protected agentStatusMap: Map<number, PsAgentStatus>;
    protected agentMemoryMap: Map<number, PsAgentMemoryData>;
    protected workers: Worker[];
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
     */
    getOrCreateAgentInstance(agentId: number): PolicySynthAgent;
    /**
     * Loads agent memory from Redis if we haven't already
     */
    loadAgentMemoryIfNeeded(agentId: number): Promise<PsAgentMemoryData>;
    processAllAgents(agentId: number): Promise<void>;
    loadAgentStatusFromRedis(agentId: number): Promise<PsAgentStatus | undefined>;
    saveAgentStatusToRedis(agentId: number): Promise<void>;
    setupStatusIfNeeded(agentId: number): Promise<void>;
    setupAgentQueue(): Promise<void>;
    updateAgentStatus(agentId: number, state: "running" | "stopped" | "paused" | "error", message?: string): Promise<void>;
    /**
     * Pause all workers in this queue so they don't pick up new jobs,
     * and let any currently running jobs finish before resolving.
     */
    pauseAllWorkersGracefully(): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map