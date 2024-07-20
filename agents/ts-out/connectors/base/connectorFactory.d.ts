import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
import { PsBaseCollaborationConnector } from "./baseCollaborationConnector.js";
type PsBaseConnectorTypes = PsBaseDocumentConnector | PsBaseNotificationsConnector | PsBaseCollaborationConnector;
export declare class PsConnectorFactory {
    static createConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseConnectorTypes | null;
    private static createDocumentConnector;
    private static createNotificationsConnector;
    private static createCollaborationConnector;
    static getConnector(agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput?: boolean): PsBaseConnectorTypes | null;
}
export {};
//# sourceMappingURL=connectorFactory.d.ts.map