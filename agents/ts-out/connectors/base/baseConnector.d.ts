import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PolicySynthOperationsAgent } from "../../base/operationsAgent.js";
import { PsAgent } from "../../dbModels/agent.js";
export declare abstract class PsBaseConnector extends PolicySynthOperationsAgent {
    connector: PsAgentConnector;
    connectorClass: PsAgentConnectorClass;
    skipAiModels: boolean;
    constructor(connector: PsAgentConnector, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get name(): string;
    get description(): string;
    getConfig<T>(uniqueId: string, defaultValue: T): T;
}
//# sourceMappingURL=baseConnector.d.ts.map