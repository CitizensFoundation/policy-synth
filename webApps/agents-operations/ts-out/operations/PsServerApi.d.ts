import { BaseChatBotServerApi } from '../chatBot/BaseChatBotApi';
import { PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';
export declare class PsServerApi extends BaseChatBotServerApi {
    baseAgentsPath: string;
    constructor(urlPath?: string);
    getAgent(groupId: number): Promise<PsAgentAttributes>;
    removeAgentAiModel(agentId: number, modelId: number): Promise<void>;
    addAgentAiModel(agentId: number, modelId: number, size: PsAiModelSize): Promise<void>;
    getCrt(groupId: number): Promise<LtpCurrentRealityTreeData>;
    updateAgentConfiguration(agentId: number, updatedConfig: Partial<PsAgentAttributes['configuration']>): Promise<void>;
    createAgent(name: string, agentClassId: number, aiModels: {
        [key: string]: number;
    }, parentAgentId: number, groupId?: number): Promise<PsAgentAttributes>;
    getAgentAiModels(agentId: number): Promise<PsAiModelAttributes[]>;
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
    createConnector(agentId: number, connectorClassId: number, name: string, type: 'input' | 'output'): Promise<PsAgentConnectorAttributes>;
    updateNode(agentId: number, updatedNode: PsAgentAttributes): Promise<void>;
    updateNodeConfiguration(nodeType: 'agent' | 'connector', nodeId: number, updatedConfig: Partial<PsAgentAttributes['configuration'] | PsAgentConnectorAttributes['configuration']>): Promise<void>;
    getAgentStatus(agentId: number): Promise<PsAgentStatus>;
    controlAgent(agentId: number, action: 'start' | 'pause' | 'stop'): Promise<any>;
    startAgent(agentId: number): Promise<any>;
    pauseAgent(agentId: number): Promise<any>;
    stopAgent(agentId: number): Promise<any>;
    deleteNode(treeId: string | number, nodeId: string): Promise<void>;
}
//# sourceMappingURL=PsServerApi.d.ts.map