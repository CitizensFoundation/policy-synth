import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { SimpleChatServerApi } from './SimpleServerApi';

@customElement('simple-chat-bot')
export class SimpleChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5011;

  @property({ type: Boolean })
  onlyUseTextField = true;

  serverApi: SimpleChatServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.textInputLabel = this.t("What's your question?");
    this.serverApi = new SimpleChatServerApi();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        .chat-window {
          height: 85vh;
        }
      `,
    ];
  }

  override async sendChatMessage() {
    const userMessage = this.chatInputField!.value;

    super.sendChatMessage();

    this.addUserChatBotMessage(userMessage);

    this.addThinkingChatBotMessage();

    await this.serverApi.conversation(this.simplifiedChatLog, this.wsClientId);
  }
}
