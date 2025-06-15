import { YpServerApi } from '@yrpri/webapp/common/YpServerApi.js';

export class ResearchServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getChatLogFromServer(
    memoryId: string
  ): Promise<{chatLog: PsSimpleChatLog[], totalCosts: number}> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `/rd_chat/${memoryId}`
    )) as {chatLog: PsSimpleChatLog[], totalCosts: number};
  }

  public conversation(
    memoryId: string,
    chatLog: PsSimpleChatLog[],
    wsClientId: string,
    topicId: number
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `/rd_chat/`,
      {
        method: 'PUT',
        body: JSON.stringify({
          wsClientId,
          memoryId,
          chatLog: chatLog,
          topicId
        }),
      },
      false
    ) as Promise<void>;
  }
}
