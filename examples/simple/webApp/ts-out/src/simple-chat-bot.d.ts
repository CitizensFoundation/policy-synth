import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { SimpleChatServerApi } from './SimpleServerApi';
export declare class SimpleChatBot extends PsChatAssistant {
    defaultDevWsPort: number;
    onlyUseTextField: boolean;
    serverApi: SimpleChatServerApi;
    connectedCallback(): void;
    static get styles(): any[];
    sendChatMessage(): Promise<void>;
}
//# sourceMappingURL=simple-chat-bot.d.ts.map