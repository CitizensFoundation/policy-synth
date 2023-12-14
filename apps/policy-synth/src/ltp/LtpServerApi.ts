import { YpServerApi } from '../@yrpri/common/YpServerApi.js';

export class LtpServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getCrt(id: string): Promise<LtpCurrentRealityTreeData> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `/crt/${id}`
    )) as unknown as LtpCurrentRealityTreeData;
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

  public reviewConfiguration(
    crt: LtpCurrentRealityTreeData
  ): Promise<string> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt/reviewConfiguration`,
      {
        method: 'PUT',
        body: JSON.stringify(crt),
      },
      false,
      undefined,
      true
    ) as Promise<string>;
  }

  public createDirectCauses(
    treeId: string,
    parentNodeId: string
  ): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt/${treeId}/createDirectCauses`,
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
    treeId: string,
    parentNodeId: string,
    causes: string[]
  ): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt/${treeId}/addDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentNodeId,
          causes
        }),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
  }

  public sendGetRefinedCauseQuery(
    crtTreeId: string,
    crtNodeId: string,
    chatLog: LtpAiChatWsMessage[]
  ): Promise<LtpChatBotCrtMessage> {

    // Filter out all chatMessages with type==thinking
    chatLog = chatLog.filter(chatMessage => chatMessage.type != 'thinking');

    const simplifiedChatLog = chatLog.map(chatMessage => {
      return {
        sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    });

    return this.fetchWrapper(
      this.baseUrlPath + `/crt/${crtTreeId}/getRefinedCauses`,
      {
        method: 'POST',
        body: JSON.stringify({ crtNodeId, chatLog: simplifiedChatLog }),
      },
      false
    ) as Promise<LtpChatBotCrtMessage>;
  }
}
