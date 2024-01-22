import { YpServerApi } from "@yrpri/webapp";
export class SimpleChatServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseUrlPath = urlPath;
    }
    conversation(chatLog, wsClientId) {
        chatLog = chatLog.filter(chatMessage => chatMessage.type != 'thinking' && chatMessage.type != 'noStreaming');
        const simplifiedChatLog = chatLog.map(chatMessage => {
            return {
                sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
                message: chatMessage.rawMessage
                    ? chatMessage.rawMessage
                    : chatMessage.message,
            };
        });
        return this.fetchWrapper(this.baseUrlPath + `simple_chat/`, {
            method: 'PUT',
            body: JSON.stringify({ wsClientId, chatLog: simplifiedChatLog }),
        }, false);
    }
}
//# sourceMappingURL=SimpleServerApi.js.map