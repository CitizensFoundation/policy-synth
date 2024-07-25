import { BaseChatBotServerApi } from '../chatBot/BaseChatBotApi';
import { PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

export class PsServerApi extends BaseChatBotServerApi {
  baseAgentsPath = '/agents/';
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getAgent(groupId: number): Promise<PsAgentAttributes> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${groupId}`,
      {},
      false
    )) as unknown as PsAgentAttributes;
  }

  public async removeAgentAiModel(
    agentId: number,
    modelId: number
  ): Promise<void> {
    return this.fetchWrapper(
      `${this.baseUrlPath}/agents/${agentId}/ai-models/${modelId}`,
      {
        method: 'DELETE',
      }
    );
  }

  public async addAgentAiModel(
    agentId: number,
    modelId: number,
    size: PsAiModelSize
  ): Promise<void> {
    return this.fetchWrapper(
      `${this.baseUrlPath}/agents/${agentId}/ai-models`,
      {
        method: 'POST',
        body: JSON.stringify({ modelId, size }),
      }
    );
  }

  public async getCrt(groupId: number): Promise<LtpCurrentRealityTreeData> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${groupId}`,
      {},
      false
    )) as unknown as LtpCurrentRealityTreeData;
  }
  public async updateAgentConfiguration(
    agentId: number,
    updatedConfig: Partial<PsAgentAttributes['configuration']>
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${agentId}/configuration`,
      {
        method: 'PUT',
        body: JSON.stringify(updatedConfig),
      },
      false
    ) as Promise<void>;
  }

  public async createAgent(
    name: string,
    agentClassId: number,
    aiModels: { [key: string]: number },
    parentAgentId: number,
    groupId?: number
  ): Promise<PsAgentAttributes> {
    return this.fetchWrapper(
      this.baseUrlPath + this.baseAgentsPath,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          agentClassId,
          aiModels,
          parentAgentId,
          groupId,
        }),
      },
      false
    ) as Promise<PsAgentAttributes>;
  }

  public async getAgentAiModels(
    agentId: number
  ): Promise<PsAiModelAttributes[]> {
    return this.fetchWrapper(
      `${this.baseUrlPath}/agents/${agentId}/ai-models`
    ) as Promise<PsAiModelAttributes[]>;
  }

  public async getActiveAiModels(): Promise<PsAiModelAttributes[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}registry/aiModels`,
      {
        method: 'GET',
      },
      false
    ) as Promise<PsAiModelAttributes[]>;
  }

  public async getActiveAgentClasses(): Promise<PsAgentClassAttributes[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}registry/agentClasses`,
      {
        method: 'GET',
      },
      false
    ) as Promise<PsAgentClassAttributes[]>;
  }

  public async getActiveConnectorClasses(): Promise<
    PsAgentConnectorClassAttributes[]
  > {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}registry/connectorClasses`,
      {
        method: 'GET',
      },
      false
    ) as Promise<PsAgentConnectorClassAttributes[]>;
  }

  public createTree(
    crt: LtpCurrentRealityTreeData
  ): Promise<LtpCurrentRealityTreeData> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt`,
      {
        method: 'POST',
        body: JSON.stringify(crt),
      },
      false
    ) as Promise<LtpCurrentRealityTreeData>;
  }

  public updateNodeChildren(
    treeId: string | number,
    nodeId: string,
    childrenIds: string[]
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${treeId}/updateChildren`,
      {
        method: 'PUT',
        body: JSON.stringify({
          nodeId,
          childrenIds,
        }),
      },
      false
    ) as Promise<void>;
  }

  public reviewConfiguration(
    wsClientId: string,
    crt: LtpCurrentRealityTreeData
  ): Promise<string> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}/reviewConfiguration`,
      {
        method: 'PUT',
        body: JSON.stringify({
          context: crt.context,
          undesirableEffects: crt.undesirableEffects,
          wsClientId,
        }),
      },
      false,
      undefined
    ) as Promise<string>;
  }

  public createDirectCauses(
    treeId: string | number,
    parentNodeId: string
  ): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${treeId}/createDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentNodeId,
        }),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
  }

  public addDirectCauses(
    treeId: string | number,
    parentNodeId: string,
    causes: string[],
    type: CrtNodeType
  ): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${treeId}/addDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentNodeId,
          causes,
          type,
        }),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
  }

  public async getAgentCosts(agentId: number): Promise<number> {
    const response = (await this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${agentId}/costs`,
      {
        method: 'GET',
      },
      false
    )) as { totalCost: string };
    return parseFloat(response.totalCost);
  }

  public sendGetRefinedCauseQuery(
    crtTreeId: string | number,
    crtNodeId: string,
    chatLog: PsAiChatWsMessage[],
    wsClientId: string,
    effect?: string,
    causes?: string[],
    validationErrors?: string[]
  ): Promise<LtpChatBotCrtMessage> {
    // Filter out all chatMessages with type==thinking
    chatLog = chatLog.filter(
      chatMessage =>
        chatMessage.type != 'thinking' && chatMessage.type != 'noStreaming'
    );

    const simplifiedChatLog = chatLog.map(chatMessage => {
      return {
        sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    });

    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${crtTreeId}/getRefinedCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          wsClientId,
          crtNodeId,
          chatLog: simplifiedChatLog,
          effect,
          causes,
          validationErrors,
        }),
      },
      false
    ) as Promise<LtpChatBotCrtMessage>;
  }

  public runValidationChain(
    crtTreeId: string | number,
    crtNodeId: string,
    chatLog: PsAiChatWsMessage[],
    wsClientId: string,
    effect: string,
    causes: string[]
  ): Promise<LtpChatBotCrtMessage> {
    // Filter out all chatMessages with type==thinking
    chatLog = chatLog.filter(
      chatMessage =>
        chatMessage.type != 'thinking' && chatMessage.type != 'noStreaming'
    );

    const simplifiedChatLog = chatLog.map(chatMessage => {
      return {
        sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    });

    return this.fetchWrapper(
      this.baseUrlPath +
        `${this.baseAgentsPath}${crtTreeId}/runValidationChain`,
      {
        method: 'POST',
        body: JSON.stringify({
          wsClientId,
          crtNodeId,
          chatLog: simplifiedChatLog,
          effect,
          causes,
        }),
      },
      false
    ) as Promise<LtpChatBotCrtMessage>;
  }

  async createConnector(
    agentId: number,
    connectorClassId: number,
    name: string,
    type: 'input' | 'output'
  ): Promise<PsAgentConnectorAttributes> {
    const response = await fetch(`/api/agents/${agentId}/${type}Connectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ connectorClassId, name }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${type} connector`);
    }

    return response.json();
  }

  public updateNode(
    agentId: number,
    updatedNode: PsAgentAttributes
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${agentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updatedNode),
      },
      false
    ) as Promise<void>;
  }

  public async updateNodeConfiguration(
    nodeType: 'agent' | 'connector',
    nodeId: number,
    updatedConfig: Partial<
      | PsAgentAttributes['configuration']
      | PsAgentConnectorAttributes['configuration']
    >
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath +
        `${this.baseAgentsPath}${nodeId}/${nodeType}/configuration`,
      {
        method: 'PUT',
        body: JSON.stringify(updatedConfig),
      },
      false
    ) as Promise<void>;
  }

  public async getAgentStatus(agentId: number): Promise<PsAgentStatus> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${agentId}/status`,
      {
        method: 'GET',
      },
      false
    ) as Promise<PsAgentStatus>;
  }

  async controlAgent(agentId: number, action: 'start' | 'pause' | 'stop') {
    return this.fetchWrapper(`/api/agents/${agentId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action: action }),
    });
  }

  async startAgent(agentId: number) {
    return this.controlAgent(agentId, 'start');
  }

  async pauseAgent(agentId: number) {
    return this.controlAgent(agentId, 'pause');
  }

  async stopAgent(agentId: number) {
    return this.controlAgent(agentId, 'stop');
  }

  public deleteNode(treeId: string | number, nodeId: string): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseAgentsPath}${treeId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ nodeId }),
      },
      false
    ) as Promise<void>;
  }
}
