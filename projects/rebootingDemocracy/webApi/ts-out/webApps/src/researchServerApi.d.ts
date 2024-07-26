import { YpServerApi } from '@yrpri/webapp/common/YpServerApi.js';
export declare class ResearchServerApi extends YpServerApi {
    constructor(urlPath?: string);
    getChatLogFromServer(memoryId: string): Promise<{
        chatLog: PsSimpleChatLog[];
        totalCosts: number;
    }>;
    conversation(memoryId: string | undefined, chatLog: PsSimpleChatLog[], wsClientId: string, numberOfSelectQueries: number, percentOfTopQueriesToSearch: number, percentOfTopResultsToScan: number): Promise<void>;
}
//# sourceMappingURL=researchServerApi.d.ts.map