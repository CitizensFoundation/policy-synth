import { YpServerApi } from '@yrpri/webapp/common/YpServerApi.js';

export class ResearchServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getChatLogFromServer(
    memoryId: string
  ): Promise<PsSimpleChatLog[]> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `/live_research_chat/${memoryId}`
    )) as PsSimpleChatLog[];
  }

  public conversation(
    chatLog: PsSimpleChatLog[],
    wsClientId: string,
    numberOfSelectQueries: number,
    percentOfTopQueriesToSearch: number,
    percentOfTopResultsToScan: number
  ): Promise<void> {
    return this.fetchWrapper(
      this.baseUrlPath + `/live_research_chat/`,
      {
        method: 'PUT',
        body: JSON.stringify({
          wsClientId,
          chatLog: chatLog,
          numberOfSelectQueries,
          percentOfTopQueriesToSearch,
          percentOfTopResultsToScan,
        }),
      },
      false
    ) as Promise<void>;
  }
}
