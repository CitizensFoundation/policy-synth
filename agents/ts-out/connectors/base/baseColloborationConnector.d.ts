import { PsBaseConnector } from "./baseConnector.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgent } from "../../dbModels/agent.js";
export declare abstract class PsBaseCollaborationConnector extends PsBaseConnector {
    constructor(connector: PsAgentConnector, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    abstract login(): Promise<void>;
    abstract post(groupId: number, postData: any, imagePrompt?: string): Promise<any>;
    abstract vote(itemId: number, value: number): Promise<void>;
    generateImage?(groupId: number, prompt: string): Promise<number>;
    protected retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
}
//# sourceMappingURL=baseColloborationConnector.d.ts.map