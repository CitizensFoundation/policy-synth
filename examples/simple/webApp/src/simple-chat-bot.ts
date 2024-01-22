import { YpBaseElement } from '@yrpri/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';

@customElement('simple-chat-bot')
export class SimpleChatBot extends YpBaseElement {
  render() {
    return html`
      <ps-chat-assistant defaultDevWsPort="8000" .textInputLabel="${this.t("What's your question?")}">
      </ps-chat-assistant>
    `;
  }
}
