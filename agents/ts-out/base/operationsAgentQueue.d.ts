import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthOperationsAgent } from "./operationsAgent.js";
export declare abstract class PolicySynthAgentQueue extends PolicySynthOperationsAgent {
    constructor();
    abstract get processors(): {
        processor: new (agent: PsAgent, memory: PsAgentMemoryData, startProgress: number, endProgress: number) => PolicySynthOperationsAgent;
        weight: number;
    }[];
    processAllAgents(): Promise<void>;
    abstract get agentQueueName(): string;
    abstract setupMemoryIfNeeded(): Promise<void>;
    setupAgentQueue(): Promise<void>;
    private startAgent;
    private stopAgent;
    private pauseAgent;
    private updateAgentStatus;
}
//# sourceMappingURL=operationsAgentQueue.d.ts.map