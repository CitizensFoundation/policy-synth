import { __decorate, __metadata } from "tslib";
import { customElement, property } from 'lit/decorators.js';
import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { SimpleChatServerApi } from './SimpleServerApi';
let SimpleChatBot = class SimpleChatBot extends PsChatAssistant {
    constructor() {
        super(...arguments);
        this.defaultDevWsPort = 5011;
    }
    connectedCallback() {
        super.connectedCallback();
        this.textInputLabel = this.t("What's your question?");
        this.serverApi = new SimpleChatServerApi();
    }
    async sendChatMessage() {
        super.sendChatMessage();
        const userMessage = this.chatInputField.value;
        this.addChatBotElement({
            sender: 'you',
            type: 'start',
            message: userMessage,
        });
        this.addChatBotElement({
            sender: 'bot',
            type: 'thinking',
            message: '',
        });
        await this.serverApi.conversation(this.chatLog, this.wsClientId);
    }
};
__decorate([
    property({ type: Number }),
    __metadata("design:type", Object)
], SimpleChatBot.prototype, "defaultDevWsPort", void 0);
SimpleChatBot = __decorate([
    customElement('simple-chat-bot')
], SimpleChatBot);
export { SimpleChatBot };
//# sourceMappingURL=simple-chat-bot.js.map