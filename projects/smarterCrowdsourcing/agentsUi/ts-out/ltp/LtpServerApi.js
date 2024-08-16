import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export class LtpServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseLtpPath = '/crt/';
        this.baseUrlPath = urlPath;
    }
    async getCrt(groupId) {
        return (await this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${groupId}`, {}, false));
    }
    createTree(crt) {
        return this.fetchWrapper(this.baseUrlPath + `/crt`, {
            method: 'POST',
            body: JSON.stringify(crt),
        }, false);
    }
    updateNodeChildren(treeId, nodeId, childrenIds) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${treeId}/updateChildren`, {
            method: 'PUT',
            body: JSON.stringify({
                nodeId,
                childrenIds
            }),
        }, false);
    }
    reviewConfiguration(wsClientId, crt) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}/reviewConfiguration`, {
            method: 'PUT',
            body: JSON.stringify({
                context: crt.context,
                undesirableEffects: crt.undesirableEffects,
                wsClientId,
            }),
        }, false, undefined);
    }
    createDirectCauses(treeId, parentNodeId) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${treeId}/createDirectCauses`, {
            method: 'POST',
            body: JSON.stringify({
                parentNodeId,
            }),
        }, false);
    }
    addDirectCauses(treeId, parentNodeId, causes, type) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${treeId}/addDirectCauses`, {
            method: 'POST',
            body: JSON.stringify({
                parentNodeId,
                causes,
                type
            }),
        }, false);
    }
    sendGetRefinedCauseQuery(crtTreeId, crtNodeId, chatLog, wsClientId, effect, causes, validationErrors) {
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
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${crtTreeId}/getRefinedCauses`, {
            method: 'POST',
            body: JSON.stringify({ wsClientId, crtNodeId, chatLog: simplifiedChatLog, effect, causes, validationErrors }),
        }, false);
    }
    runValidationChain(crtTreeId, crtNodeId, chatLog, wsClientId, effect, causes) {
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
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${crtTreeId}/runValidationChain`, {
            method: 'POST',
            body: JSON.stringify({
                wsClientId,
                crtNodeId,
                chatLog: simplifiedChatLog,
                effect,
                causes,
            }),
        }, false);
    }
    updateNode(treeId, updatedNode) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${treeId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedNode),
        }, false);
    }
    deleteNode(treeId, nodeId) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseLtpPath}${treeId}`, {
            method: 'DELETE',
            body: JSON.stringify({ nodeId }),
        }, false);
    }
}
//# sourceMappingURL=LtpServerApi.js.map