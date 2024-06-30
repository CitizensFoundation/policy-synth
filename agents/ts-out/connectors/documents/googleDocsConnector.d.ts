import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
export declare class GoogleDocsConnector extends PsBaseDocumentConnector {
    private static readonly GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID;
    private static readonly GOOGLE_DOCS_CONNECTOR_VERSION;
    static getConnectorClass: PsConnectorClassCreationAttributes;
    private client;
    private docs;
    constructor(connector: PsAgentConnector, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    getDocument(): Promise<string>;
    updateDocument(doc: string): Promise<void>;
    private getData;
    private extractText;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=googleDocsConnector.d.ts.map