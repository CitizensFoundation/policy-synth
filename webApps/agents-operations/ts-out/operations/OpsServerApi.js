import { BaseChatBotServerApi } from '../chatBot/BaseChatBotApi';
export class OpsServerApi extends BaseChatBotServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseAgentsPath = '/agents/';
        this.baseUrlPath = urlPath;
    }
    async getAgent(groupId) {
        return (await this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${groupId}`, {}, false));
    }
    async removeAgentAiModel(agentId, modelId) {
        return this.fetchWrapper(`${this.baseUrlPath}/agents/${agentId}/ai-models/${modelId}`, {
            method: 'DELETE',
        });
    }
    async addAgentAiModel(agentId, modelId, size) {
        return this.fetchWrapper(`${this.baseUrlPath}/agents/${agentId}/ai-models`, {
            method: 'POST',
            body: JSON.stringify({ modelId, size }),
        });
    }
    async getCrt(groupId) {
        return (await this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${groupId}`, {}, false));
    }
    async updateAgentConfiguration(agentId, updatedConfig) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${agentId}/configuration`, {
            method: 'PUT',
            body: JSON.stringify(updatedConfig),
        }, false);
    }
    async createAgent(name, agentClassId, aiModels, parentAgentId, groupId) {
        return this.fetchWrapper(this.baseUrlPath + this.baseAgentsPath, {
            method: 'POST',
            body: JSON.stringify({
                name,
                agentClassId,
                aiModels,
                parentAgentId,
                groupId,
            }),
        }, false);
    }
    async getAgentAiModels(agentId) {
        return this.fetchWrapper(`${this.baseUrlPath}/agents/${agentId}/ai-models`);
    }
    async getActiveAiModels() {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}registry/aiModels`, {
            method: 'GET',
        }, false);
    }
    async getActiveAgentClasses() {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}registry/agentClasses`, {
            method: 'GET',
        }, false);
    }
    async getActiveConnectorClasses() {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}registry/connectorClasses`, {
            method: 'GET',
        }, false);
    }
    createTree(crt) {
        return this.fetchWrapper(this.baseUrlPath + `/crt`, {
            method: 'POST',
            body: JSON.stringify(crt),
        }, false);
    }
    updateNodeChildren(treeId, nodeId, childrenIds) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${treeId}/updateChildren`, {
            method: 'PUT',
            body: JSON.stringify({
                nodeId,
                childrenIds,
            }),
        }, false);
    }
    reviewConfiguration(wsClientId, crt) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}/reviewConfiguration`, {
            method: 'PUT',
            body: JSON.stringify({
                context: crt.context,
                undesirableEffects: crt.undesirableEffects,
                wsClientId,
            }),
        }, false, undefined);
    }
    createDirectCauses(treeId, parentNodeId) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${treeId}/createDirectCauses`, {
            method: 'POST',
            body: JSON.stringify({
                parentNodeId,
            }),
        }, false);
    }
    addDirectCauses(treeId, parentNodeId, causes, type) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${treeId}/addDirectCauses`, {
            method: 'POST',
            body: JSON.stringify({
                parentNodeId,
                causes,
                type,
            }),
        }, false);
    }
    async getAgentCosts(agentId) {
        const response = (await this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${agentId}/costs`, {
            method: 'GET',
        }, false));
        return parseFloat(response.totalCost);
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
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${crtTreeId}/getRefinedCauses`, {
            method: 'POST',
            body: JSON.stringify({
                wsClientId,
                crtNodeId,
                chatLog: simplifiedChatLog,
                effect,
                causes,
                validationErrors,
            }),
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
        return this.fetchWrapper(this.baseUrlPath +
            `${this.baseAgentsPath}${crtTreeId}/runValidationChain`, {
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
    async createConnector(agentId, connectorClassId, name, type) {
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
    updateNode(agentId, updatedNode) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${agentId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedNode),
        }, false);
    }
    async updateNodeConfiguration(nodeType, nodeId, updatedConfig) {
        return this.fetchWrapper(this.baseUrlPath +
            `${this.baseAgentsPath}${nodeId}/${nodeType}/configuration`, {
            method: 'PUT',
            body: JSON.stringify(updatedConfig),
        }, false);
    }
    async getAgentStatus(agentId) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${agentId}/status`, {
            method: 'GET',
        }, false);
    }
    async controlAgent(agentId, action) {
        return this.fetchWrapper(`/api/agents/${agentId}/control`, {
            method: 'POST',
            body: JSON.stringify({ action: action }),
        });
    }
    async startAgent(agentId) {
        return this.controlAgent(agentId, 'start');
    }
    async pauseAgent(agentId) {
        return this.controlAgent(agentId, 'pause');
    }
    async stopAgent(agentId) {
        return this.controlAgent(agentId, 'stop');
    }
    deleteNode(treeId, nodeId) {
        return this.fetchWrapper(this.baseUrlPath + `${this.baseAgentsPath}${treeId}`, {
            method: 'DELETE',
            body: JSON.stringify({ nodeId }),
        }, false);
    }
}
//# sourceMappingURL=OpsServerApi.js.map