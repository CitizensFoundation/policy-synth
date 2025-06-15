import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { nothing, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { PsChatAssistant } from './base/ps-chat-assistant.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';

import { MdFilledTextField } from '@material/web/textfield/filled-text-field.js';
import { ResearchServerApi } from './researchServerApi.js';
import { adminServerApi, ReviewCreateDTO } from './services/adminServerApi.js';

interface PsSimpleChatLog {
    sender: 'user' | 'assistant' | 'bot';
    message: string;
    type?: string;
}

@customElement('eric-chat-bot')
export class EcasEricChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 4078;

  @property({ type: String })
  einfachenApiProxy = '/api';

  @property({ type: Boolean })
  showResetButton = true;

  @property({ type: String })
  serverMemoryId: string | undefined;

  @property({ type: Array })
  chatLogFromServer: PsSimpleChatLog[] | undefined;

  @property({ type: Number })
  currentTopicId: number | undefined;

  @state()
  currentRatingForLastAnswer: number = 0;

  serverApiClass = ResearchServerApi;
  ownServerApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = undefined;
    this.textInputLabel = this.t("Ask me anything, I'm here to help");
    this.ownServerApi = new this.serverApiClass();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        .chat-window {
          height: 78vh;
          width: 1000px;
        }
      `,
    ];
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('chatLogFromServer') && this.chatLogFromServer) {
      this.chatLog = this.chatLogFromServer as PsAiChatWsMessage[];
    }
  }

  addChatBotError(error: string) {
    this.chatLog.push({
      sender: 'bot',
      message: error,
      type: 'error'
    });
  }

  override async sendChatMessage() {
    if (this.currentTopicId === undefined && this.chatLog.length === 0 && !this.serverMemoryId) {
      this.addChatBotError(this.t('Please select a topic first.'));
      return;
    }

    const userMessage = this.chatInputField!.value;
    this.addUserChatBotMessage(userMessage);

    const serverApi = new ResearchServerApi();
    await serverApi.conversation(
      this.serverMemoryId,
      this.simplifiedChatLog,
      this.wsClientId,
      this.currentTopicId
    );
  }

  async sha256(text: string): Promise<string> {
    if (!text) return '';
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error("Error generating SHA256 hash:", error);
        return 'error-generating-hash';
    }
  }

  async handleBotMessageRated(messageContent: string, rating: number) {
    this.currentRatingForLastAnswer = rating;
    console.log(`Rated answer with ${rating} stars`);
    if (rating > 0) {
        try {
            const answerHash = await this.sha256(messageContent);
            const reviewDTO: ReviewCreateDTO = {
                answerHash: answerHash,
                rating: rating,
            };
            await adminServerApi.createReview(reviewDTO);
            console.log("Review submitted successfully for answer hash:", answerHash);
            this.requestUpdate();
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    }
  }

 renderChatItem(item: any, index: number): TemplateResult {
    let baseChatItem = html`<div>${item.message}</div>`;

    if (item.sender === 'bot') {
        const isLastMessageInLog = index === (this.chatLog.length - 1);
        let ratingStarsHtml = html``;

        if (isLastMessageInLog) {
            ratingStarsHtml = html`
                <div class="ratingStars" style="margin-left: 40px; margin-top: 4px;">
                    ${[1, 2, 3, 4, 5].map(star => html`
                    <md-filled-icon-button
                        toggle
                        .selected=${this.currentRatingForLastAnswer >= star}
                        @click=${() => this.handleBotMessageRated(item.message, star)}
                        aria-label="Rate ${star} of 5">
                        <md-icon>${this.currentRatingForLastAnswer >= star ? 'star' : 'star_border'}</md-icon>
                    </md-filled-icon-button>
                    `)}
                </div>`;
        }
        return html`<div>${baseChatItem}${ratingStarsHtml}</div>`;
    }
    return baseChatItem;
  }

 /* override addMessageToChatLog(message: string, sender: 'user' | 'bot' | 'assistant', type?: string | undefined, votingData?: any): void {
      if (sender === 'user') {
          this.currentRatingForLastAnswer = 0;
      }
      super.addMessageToChatLog(message, sender, type, votingData);
  }

  override onWsMessage(event: MessageEvent<any>): void {
    super.onWsMessage(event);

    const data = JSON.parse(event.data);
    if (data.sender === 'bot' && data.type === 'end') {
        this.currentRatingForLastAnswer = 0;
        this.requestUpdate();
    }
  }*/

  override reset() {
    super.reset();
    this.currentRatingForLastAnswer = 0;
  }

   getWsPayload(): object {
    const basePayload = {
      topicId: this.currentTopicId,
      memoryId: this.serverMemoryId
    }
    return basePayload;
  }
}
