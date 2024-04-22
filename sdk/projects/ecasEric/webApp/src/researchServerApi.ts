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
    memoryId: string | undefined,
    chatLog: PsSimpleChatLog[],
    wsClientId: string,
    numberOfSelectQueries: number,
    percentOfTopQueriesToSearch: number,
    percentOfTopResultsToScan: number
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `/rd_chat/`,
      {
        method: 'PUT',
        body: JSON.stringify({
          wsClientId,
          chatLog: chatLog,
          numberOfSelectQueries,
          percentOfTopQueriesToSearch,
          percentOfTopResultsToScan,
          memoryId
        }),
      },
      false
    ) as Promise<void>;
  }
}
