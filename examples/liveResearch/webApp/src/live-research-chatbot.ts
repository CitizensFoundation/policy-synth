import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';

@customElement('live-research-chat-bot')
export class LiveResearchChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5021;

  serverApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = this.t("I'm your helpful web research assistant")
    this.textInputLabel = this.t("Please state your research question.");
    this.serverApi = new ResearchServerApi();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        .chat-window {
          height: 85vh;
          width: 100vw;
        }
      `,
    ];
  }

  override async sendChatMessage() {
    const userMessage = this.chatInputField!.value;

    super.sendChatMessage();

    this.addUserChatBotMessage(userMessage);

    await this.serverApi.conversation(this.simplifiedChatLog, this.wsClientId);
  }
}
