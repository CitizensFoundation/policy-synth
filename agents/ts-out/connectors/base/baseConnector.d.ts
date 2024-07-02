import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PolicySynthOperationsAgent } from "../../base/operationsAgent.js";
import { PsAgent } from "../../dbModels/agent.js";
export declare abstract class PsBaseConnector extends PolicySynthOperationsAgent {
    connector: PsAgentConnectorAttributes;
    connectorClass: PsAgentConnectorClass;
    skipAiModels: boolean;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get name(): string;
    get description(): string;
    getConfig<T>(uniqueId: string, defaultValue: T): T;
}
//# sourceMappingURL=baseConnector.d.ts.map