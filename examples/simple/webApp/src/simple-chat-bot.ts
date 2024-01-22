import { YpBaseElement } from '@policysynth/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@policysynth/webapp/ts-out/src/chatBot/ps-chat-assistant.js';
import { PsChatAssistant } from '@policysynth/webapp/ts-out/src/chatBot/ps-chat-assistant.js';

@customElement('simple-chat-bot')
export class SimpleChatBot extends YpBaseElement {
  render() {
    return html`
      <ps-chat-assistant .textInputLabel="${this.t("What's your question?")}">
      </ps-chat-assistant>
    `;
  }

  something() {
    const a = this.$$("ps-chat-assistant") as PsChatAssistant
  }
}
