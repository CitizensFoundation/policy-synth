import { PsAgent } from "../../dbModels/agent";
import { PsBaseVotingCollaborationConnector } from "../base/baseVotingCollaborationConnector.js";
export declare class PsAllOurIdeasConnector extends PsBaseVotingCollaborationConnector {
    static readonly ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID = "aafcfd1a-3f6a-7b9c-3d0e-1f2a1b4c5d6e";
    static readonly ALL_OUR_IDEAS_CONNECTOR_VERSION = 1;
    static getConnectorClass: {
        created_at: Date;
        updated_at: Date;
        class_base_id: string;
        name: string;
        version: number;
        user_id: number;
        available: boolean;
        configuration: PsAgentConnectorConfiguration;
    };
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