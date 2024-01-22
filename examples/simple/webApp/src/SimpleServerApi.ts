import { YpServerApi } from "@yrpri/webapp";

export class SimpleChatServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public conversation(
    chatLog: PsSimpleChatLog[],
    wsClientId: string,
  ): Promise<void> {

    return this.fetchWrapper(
      this.baseUrlPath + `simple_chat/`,
      {
        method: 'PUT',
        body: JSON.stringify({ wsClientId, chatLog: simplifiedChatLog }),
      },
      false
    ) as Promise<void>;
  }

}
