import { customElement, property } from 'lit/decorators.js';

import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { SimpleChatServerApi } from './SimpleServerApi';

@customElement('simple-chat-bot')
export class SimpleChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5011;

  serverApi: SimpleChatServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.textInputLabel = this.t("What's your question?");
    this.serverApi = new SimpleChatServerApi();
  }

  override async sendChatMessage() {
    super.sendChatMessage();

    const userMessage = this.chatInputField!.value;

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
}
