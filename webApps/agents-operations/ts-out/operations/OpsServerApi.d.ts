import { BaseChatBotServerApi } from "../chatBot/BaseChatBotApi";
export declare class OpsServerApi extends BaseChatBotServerApi {
    baseAgentsPath: string;
    constructor(urlPath?: string);
    getAgent(agentId: number): Promise<PsAgentAttributes>;
    getCrt(groupId: number): Promise<LtpCurrentRealityTreeData>;
    getActiveAiModels(): Promise<PsAiModelAttributes[]>;
    getActiveAgentClasses(): Promise<PsAgentClassAttributes[]>;
    getActiveConnectorClasses(): Promise<PsAgentConnectorClassAttributes[]>;
    createTree(crt: LtpCurrentRealityTreeData): Promise<LtpCurrentRealityTreeData>;
    updateNodeChildren(treeId: string | number, nodeId: string, childrenIds: string[]): Promise<void>;
    reviewConfiguration(wsClientId: string, crt: LtpCurrentRealityTreeData): Promise<string>;
    createDirectCauses(treeId: string | number, parentNodeId: string): Promise<LtpCurrentRealityTreeDataNode[]>;
    addDirectCauses(treeId: string | number, parentNodeId: string, causes: string[], type: CrtNodeType): Promise<LtpCurrentRealityTreeDataNode[]>;
    getAgentCosts(agentId: number): Promise<number>;
    sendGetRefinedCauseQuery(crtTreeId: string | number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[]): Promise<LtpChatBotCrtMessage>;
    runValidationChain(crtTreeId: string | number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect: string, causes: string[]): Promise<LtpChatBotCrtMessage>;
    updateNode(agentId: number, updatedNode: PsAgentAttributes): Promise<void>;
    updateNodeConfiguration(agentId: number, nodeId: number, nodeType: 'agent' | 'connector', updatedConfig: any): Promise<void>;
    getAgentStatus(agentId: number): Promise<PsAgentStatus>;
    controlAgent(agentId: number, action: 'start' | 'pause' | 'stop'): Promise<any>;
    startAgent(agentId: number): Promise<any>;
    pauseAgent(agentId: number): Promise<any>;
    stopAgent(agentId: number): Promise<any>;
    deleteNode(treeId: string | number, nodeId: string): Promise<void>;
}
//# sourceMappingURL=OpsServerApi.d.ts.map