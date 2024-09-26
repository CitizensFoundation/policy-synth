import { PsAgent } from "../../dbModels/agent";
import { PsBaseIdeasCollaborationConnector } from "../base/baseIdeasCollaborationConnector.js";
export declare class PsYourPrioritiesConnector extends PsBaseIdeasCollaborationConnector {
    static readonly YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID = "1bfc3d1e-5f6a-7b8c-9d0e-1f2a3b4c5d6e";
    static readonly YOUR_PRIORITIES_CONNECTOR_VERSION = 7;
    static baseQuestions: YpStructuredQuestionData[];
    static loginQuestions: YpStructuredQuestionData[];
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    userEmail: string;
    password: string;
    serverBaseUrl: string;
    sessionCookie?: string;
    user?: YpUserData;
    agentFabricUserId?: number;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    login(): Promise<void>;
    getHeaders(): {
        "x-api-key": string;
        Cookie?: undefined;
    } | {
        Cookie: string | undefined;
        "x-api-key"?: undefined;
    };
    getGroupPosts(groupId: number): Promise<YpPostData[]>;
    vote(postId: number, value: number): Promise<void>;
    post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData>;
    generateImageWithAi(groupId: number, prompt: string): Promise<number>;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=yourPrioritiesConnector.d.ts.map