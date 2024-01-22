import { __decorate, __metadata } from "tslib";
import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';
import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { SimpleChatServerApi } from './SimpleServerApi';
let SimpleChatBot = class SimpleChatBot extends PsChatAssistant {
    constructor() {
        super(...arguments);
        this.defaultDevWsPort = 5011;
        this.onlyUseTextField = true;
    }
    connectedCallback() {
        super.connectedCallback();
        this.textInputLabel = this.t("What's your question?");
        this.serverApi = new SimpleChatServerApi();
    }
    static get styles() {
        return [
            ...super.styles,
            css `
        .chat-window {
          height: 85vh;
        }
      `,
        ];
    }
    async sendChatMessage() {
        const userMessage = this.chatInputField.value;
        super.sendChatMessage();
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
        await this.serverApi.conversation(this.simplifiedChatLog, this.wsClientId);
    }
};
__decorate([
    property({ type: Number }),
    __metadata("design:type", Object)
], SimpleChatBot.prototype, "defaultDevWsPort", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], SimpleChatBot.prototype, "onlyUseTextField", void 0);
SimpleChatBot = __decorate([
    customElement('simple-chat-bot')
], SimpleChatBot);
export { SimpleChatBot };
//# sourceMappingURL=simple-chat-bot.js.map