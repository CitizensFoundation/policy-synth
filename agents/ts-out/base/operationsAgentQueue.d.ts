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
    setupAgentQueue(): Promise<void>;
}
//# sourceMappingURL=operationsAgentQueue.d.ts.map