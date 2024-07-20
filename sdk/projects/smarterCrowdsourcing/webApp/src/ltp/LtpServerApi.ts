import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";

export class LtpServerApi extends YpServerApi {
  baseLtpPath = '/crt/';
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getCrt(groupId: number): Promise<LtpCurrentRealityTreeData> {
    return (await this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${groupId}`,{}, false)) as unknown as LtpCurrentRealityTreeData;
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
      this.baseUrlPath + `${this.baseLtpPath}${treeId}/updateChildren`,
      {
        method: 'PUT',
        body: JSON.stringify({
          nodeId,
          childrenIds
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
      this.baseUrlPath + `${this.baseLtpPath}/reviewConfiguration`,
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
      this.baseUrlPath + `${this.baseLtpPath}${treeId}/createDirectCauses`,
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
      this.baseUrlPath + `${this.baseLtpPath}${treeId}/addDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentNodeId,
          causes,
          type
        }),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
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
    chatLog = chatLog.filter(chatMessage => chatMessage.type != 'thinking' && chatMessage.type != 'noStreaming');

    const simplifiedChatLog = chatLog.map(chatMessage => {
      return {
        sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    });

    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseLtpPath}${crtTreeId}/getRefinedCauses`,
      {
        method: 'POST',
        body: JSON.stringify({ wsClientId, crtNodeId, chatLog: simplifiedChatLog, effect, causes, validationErrors }),
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
    chatLog = chatLog.filter(chatMessage => chatMessage.type != 'thinking' && chatMessage.type != 'noStreaming');

    const simplifiedChatLog = chatLog.map(chatMessage => {
      return {
        sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    });

    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseLtpPath}${crtTreeId}/runValidationChain`,
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


  public updateNode(
    treeId: string | number,
    updatedNode: LtpCurrentRealityTreeDataNode
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseLtpPath}${treeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updatedNode),
      },
      false
    ) as Promise<void>;
  }

  public deleteNode(
    treeId: string | number,
    nodeId: string
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `${this.baseLtpPath}${treeId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ nodeId }),
      },
      false
    ) as Promise<void>;
  }
}
