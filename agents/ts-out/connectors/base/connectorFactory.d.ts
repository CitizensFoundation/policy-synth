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
    private static createDocumentConnector;
    private static createSheetConnector;
    private static createNotificationsConnector;
    private static createIdeasCollaborationConnector;
    private static createVotingCollaborationConnector;
    static getConnector(agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput?: boolean): PsBaseConnectorTypes | null;
}
export {};
//# sourceMappingURL=connectorFactory.d.ts.map