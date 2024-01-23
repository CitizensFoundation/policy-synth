import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './ResearchServerApi';

@customElement('live-research-chat-bot')
export class LiveResearchChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5011;

  @property({ type: Boolean })
  onlyUseTextField = true;

  serverApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.textInputLabel = this.t("What's your question?");
    this.serverApi = new ResearchServerApi();
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
