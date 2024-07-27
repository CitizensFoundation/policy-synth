import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
import { PsBaseIdeasCollaborationConnector } from "./baseIdeasCollaborationConnector.js";
import { PsBaseVotingCollaborationConnector } from "./baseVotingCollaborationConnector.js";
import { PsBaseSheetConnector } from "./baseSheetConnector.js";
type PsBaseConnectorTypes = PsBaseDocumentConnector | PsBaseSheetConnector | PsBaseNotificationsConnector | PsBaseVotingCollaborationConnector | PsBaseIdeasCollaborationConnector;
export declare class PsConnectorFactory {
    static createConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseConnectorTypes | null;
    static createDocumentConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseDocumentConnector | null;
    static createSheetConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseSheetConnector | null;
    static createNotificationsConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseNotificationsConnector | null;
    static createIdeasCollaborationConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseIdeasCollaborationConnector | null;
    static createVotingCollaborationConnector(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any): PsBaseVotingCollaborationConnector | null;
    static getConnector(agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput?: boolean): PsBaseConnectorTypes | null;
}
export {};
//# sourceMappingURL=connectorFactory.d.ts.map