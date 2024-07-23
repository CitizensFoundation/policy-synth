import { PsAgent } from "../../dbModels/agent";
import { PsBaseVotingCollaborationConnector } from "../base/baseVotingCollaborationConnector.js";
export declare class PsAllOurIdeasConnector extends PsBaseVotingCollaborationConnector {
    private static readonly ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID;
    private static readonly ALL_OUR_IDEAS_CONNECTOR_VERSION;
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
    private userEmail;
    private password;
    private serverBaseUrl;
    private sessionCookie?;
    private user?;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    login(): Promise<void>;
    vote(postId: number, value: number): Promise<void>;
    postItems(groupId: number, itesm: []): Promise<boolean>;
}
//# sourceMappingURL=allOurIdeasConnector.d.ts.map