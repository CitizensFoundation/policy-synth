import { PolicySynthAgent } from "../../base/agent.js";
import { PsAgent } from "../../dbModels/agent.js";
export declare abstract class PsBaseConnector extends PolicySynthAgent {
    connector: PsAgentConnectorAttributes;
    connectorClass: PsAgentConnectorClassAttributes;
    skipAiModels: boolean;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get name(): string;
    get description(): string;
    getConfig<T>(uniqueId: string, defaultValue: T): T;
}
//# sourceMappingURL=baseConnector.d.ts.map