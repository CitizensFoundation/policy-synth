import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';
export declare class RebootingDemocracyChatBot extends PsChatAssistant {
    defaultDevWsPort: number;
    numberOfSelectQueries: number;
    percentOfTopQueriesToSearch: number;
    percentOfTopResultsToScan: number;
    chatLogFromServer: PsAiChatWsMessage[] | undefined;
    showCleanupButton: boolean;
    onlyUseTextField: boolean;
    serverApi: ResearchServerApi;
    connectedCallback(): void;
    static get styles(): any[];
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    sendChatMessage(): Promise<void>;
}
//# sourceMappingURL=rebooting-democracy-chatbot.d.ts.map