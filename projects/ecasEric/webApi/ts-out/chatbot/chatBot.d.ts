import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import WebSocket from "ws";
export declare class EcasYeaChatBot extends PsBaseChatBot {
    persistMemory: boolean;
    mainSreamingSystemPrompt: string;
    mainStreamingUserPrompt: (latestQuestion: string, context: string, countryLinksInfo: string | undefined, euSignpostsInfo: string | undefined) => string;
    searchContext?: {
        question: string;
        answer: string;
    }[];
    constructor(wsClientId: string, wsClients: Map<string, WebSocket>, memoryId?: string);
    setupSearchContext(): Promise<void>;
    sendSourceDocuments(document: PsSimpleDocumentSource[]): void;
    getChunksFromXlsx(filePath: string): Promise<{
        question: string;
        answer: string;
    }[]>;
    loadCountryLinksInfo(country: string): Promise<string | undefined>;
    loadEuSignpostsInfo(): Promise<string | undefined>;
    ecasYeaConversation(chatLog: PsSimpleChatLog[]): Promise<void>;
}
//# sourceMappingURL=chatBot.d.ts.map