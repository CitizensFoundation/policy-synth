import { __decorate } from "tslib";
import { YpBaseElement } from '@policysynth/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@policysynth/webapp/pso/chatBot/ps-chat-assistant.js';
let SimpleChatBot = class SimpleChatBot extends YpBaseElement {
    render() {
        return html `
      <ps-chat-assistant .textInputLabel="${this.t("What's your question?")}">
      </ps-chat-assistant>
    `;
    }
    something() {
        const a = this.$$("ps-chat-assistant");
    }
};
SimpleChatBot = __decorate([
    customElement('simple-chat-bot')
], SimpleChatBot);
export { SimpleChatBot };
//# sourceMappingURL=simple-chat-bot.js.map