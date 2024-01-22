import { YpServerApi } from "@yrpri/webapp";
export class SimpleChatServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseUrlPath = urlPath;
    }
    conversation(chatLog, wsClientId) {
        return this.fetchWrapper(this.baseUrlPath + `/simple_chat/`, {
            method: 'PUT',
            body: JSON.stringify({ wsClientId, chatLog: chatLog }),
        }, false);
    }
}
//# sourceMappingURL=SimpleServerApi.js.map