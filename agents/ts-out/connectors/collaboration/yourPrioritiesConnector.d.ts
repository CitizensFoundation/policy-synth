import { PsAgentConnector } from "../../dbModels/agentConnector";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass";
import { PsAgent } from "../../dbModels/agent";
import { PsBaseConnector } from "../base/baseConnector.js";
export declare class PsYourPrioritiesConnector extends PsBaseConnector {
    private static readonly YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID;
    private static readonly YOUR_PRIORITIES_CONNECTOR_VERSION;
    static getConnectorClass: {
        created_at: Date;
        updated_at: Date;
        class_base_id: string;
        name: string;
        version: number;
        user_id: number;
        available: boolean;
        configuration: {
            name: string;
            description: string;
            imageUrl: string;
            iconName: string;
            questions: ({
                uniqueId: string;
                text: string;
                type: string;
                maxLength: number;
                required: boolean;
                subType?: undefined;
            } | {
                uniqueId: string;
                text: string;
                type: string;
                subType: string;
                maxLength: number;
                required: boolean;
            })[];
        };
    };
    private userEmail;
    private password;
    private serverBaseUrl;
    private sessionCookie?;
    private user?;
    constructor(connector: PsAgentConnector, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    private login;
    private vote;
    post(groupId: number, postData: any, imagePrompt: string): Promise<YpPostData>;
    private generateImageWithAi;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=yourPrioritiesConnector.d.ts.map