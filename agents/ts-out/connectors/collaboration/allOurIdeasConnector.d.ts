import { PsAgent } from "../../dbModels/agent";
import { PsBaseVotingCollaborationConnector } from "../base/baseVotingCollaborationConnector.js";
export declare class PsAllOurIdeasConnector extends PsBaseVotingCollaborationConnector {
    static readonly ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID = "aafcfd1a-3f6a-7b9c-3d0e-1f2a1b4c5d6e";
    static readonly ALL_OUR_IDEAS_CONNECTOR_VERSION = 2;
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    userEmail: string;
    password: string;
    serverBaseUrl: string;
    sessionCookie?: string;
    user?: YpUserData;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    login(): Promise<void>;
    vote(postId: number, value: number): Promise<void>;
    postItems(groupId: number, itesm: []): Promise<boolean>;
}
//# sourceMappingURL=allOurIdeasConnector.d.ts.map