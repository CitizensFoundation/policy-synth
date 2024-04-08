import { customElement, property } from 'lit/decorators.js';
import { css, html } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';
import './rb-ai-chat-element.js';

@customElement('rebooting-democracy-chat-bot')
export class RebootingDemocracyChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5043;

  @property({ type: Number })
  numberOfSelectQueries = 5;

  @property({ type: Number })
  percentOfTopQueriesToSearch = 0.25;

  @property({ type: Number })
  percentOfTopResultsToScan = 0.25;

  @property({ type: Array })
  chatLogFromServer: PsAiChatWsMessage[] | undefined;

  onlyUseTextField = true;

  serverApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = this.t("I'm your helpful web Rebooting Democracy assistant");
    this.textInputLabel = this.t('How can I help?');
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

  override render() {
    return html`
      ${this.renderSourceDialog()}
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ps-ai-chat-element
            ?hidden="${!this.defaultInfoMessage}"
            class="chatElement bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="info"
            sender="bot"
          ></ps-ai-chat-element>
          ${this.chatLog
            .filter(chatElement => !chatElement.hidden)
            .map(
              chatElement => html`
                <rb-ai-chat-element
                  ?thinking="${chatElement.type === 'thinking' ||
                  chatElement.type === 'noStreaming'}"
                  @followup-question="${this.followUpQuestion}"
                  @ps-open-source-dialog="${this.openSourceDialog}"
                  .clusterId="${this.clusterId}"
                  class="chatElement ${chatElement.sender}-chat-element"
                  .detectedLanguage="${this.language}"
                  .wsMessage="${chatElement}"
                  .message="${chatElement.message}"
                  @scroll-down-enabled="${() => (this.userScrolled = false)}"
                  .type="${chatElement.type}"
                  .sender="${chatElement.sender}"
                ></rb-ai-chat-element>
              `
            )}
        </div>
        <div class="layout horizontal center-center chat-input">
          ${this.renderChatInput()}
        </div>
      </div>
    `;
  }


}
