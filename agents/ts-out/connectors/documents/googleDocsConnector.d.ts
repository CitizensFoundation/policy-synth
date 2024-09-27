import { docs_v1 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
export declare class PsGoogleDocsConnector extends PsBaseDocumentConnector {
    static readonly GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID = "3a7b2c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";
    static readonly GOOGLE_DOCS_CONNECTOR_VERSION = 6;
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    client: JWT;
    docs: docs_v1.Docs;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    getDocument(): Promise<string>;
    updateDocument(doc: string): Promise<void>;
    getData(documentId: string): Promise<docs_v1.Schema$Document>;
    markdownToGoogleDocs(markdown: string): {
        requests: docs_v1.Schema$Request[];
    };
    updateDocumentFromMarkdown(markdown: string): Promise<void>;
    extractText(content: docs_v1.Schema$StructuralElement[]): string;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=googleDocsConnector.d.ts.map