import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthAgent } from "./agent.js";
export declare abstract class PolicySynthAgentQueue extends PolicySynthAgent {
    constructor();
    abstract get processors(): Array<{
        processor: new (agent: PsAgent, memory: any, //TODO: Fix this to T or something
        startProgress: number, endProgress: number) => PolicySynthAgent;
        weight: number;
    }>;
    processAllAgents(): Promise<void>;
    abstract get agentQueueName(): string;
    abstract setupMemoryIfNeeded(): Promise<void>;
    setupAgentQueue(): Promise<void>;
    private startAgent;
    private stopAgent;
    private pauseAgent;
    private updateAgentStatus;
}
//# sourceMappingURL=agentQueue.d.ts.map