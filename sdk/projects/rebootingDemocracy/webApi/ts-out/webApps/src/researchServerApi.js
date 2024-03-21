import { YpServerApi } from '@yrpri/webapp/common/YpServerApi.js';
export class ResearchServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseUrlPath = urlPath;
    }
    async getChatLogFromServer(memoryId) {
        return (await this.fetchWrapper(this.baseUrlPath + `/live_research_chat/${memoryId}`));
    }
    conversation(memoryId, chatLog, wsClientId, numberOfSelectQueries, percentOfTopQueriesToSearch, percentOfTopResultsToScan) {
        return this.fetchWrapper(this.baseUrlPath + `/live_research_chat/`, {
            method: 'PUT',
            body: JSON.stringify({
                wsClientId,
                chatLog: chatLog,
                numberOfSelectQueries,
                percentOfTopQueriesToSearch,
                percentOfTopResultsToScan,
                memoryId
            }),
        }, false);
    }
}
