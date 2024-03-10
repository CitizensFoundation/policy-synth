import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';

@customElement('live-research-chat-bot')
export class LiveResearchChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5029;

  @property({ type: Number })
  numberOfSelectQueries = 5;

  @property({ type: Number })
  percentOfTopQueriesToSearch = 0.25;

  @property({ type: Number })
  percentOfTopResultsToScan = 0.25;

  @property({ type: Array })
  chatLogFromServer: PsAiChatWsMessage[] | undefined;

  showCleanupButton = true;

  serverApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = this.t("I'm your helpful web research assistant");
    this.textInputLabel = this.t('Please state your research question.');
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

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('chatLogFromServer') && this.chatLogFromServer) {
      this.chatLog = this.chatLogFromServer;
    }
  }

  override async sendChatMessage() {
    const userMessage = this.chatInputField!.value;
    if (this.chatLog.length === 0) {
      this.fire('start-process');
    }
    super.sendChatMessage();

    this.addUserChatBotMessage(userMessage);

    await this.serverApi.conversation(
      this.serverMemoryId,
      this.simplifiedChatLog,
      this.wsClientId,
      this.numberOfSelectQueries,
      this.percentOfTopQueriesToSearch,
      this.percentOfTopResultsToScan
    );
  }
}
