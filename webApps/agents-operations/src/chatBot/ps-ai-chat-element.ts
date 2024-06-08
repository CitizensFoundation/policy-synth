import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { resolveMarkdown } from './litMarkdown.js';
import '@material/web/icon/icon.js';
import '@material/web/checkbox/checkbox.js';

import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/filled-text-field.js';

import '@material/web/progress/circular-progress.js';
import { jsonrepair } from 'jsonrepair';
import '@yrpri/webapp/common/yp-image.js';
import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
import { BaseChatBotServerApi } from './BaseChatBotApi.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

@customElement('ps-ai-chat-element')
export class PsAiChatElement extends YpBaseElement {
  @property({ type: String })
  message!: string;

  @property({ type: Object })
  wsMessage!: PsAiChatWsMessage;

  @property({ type: String })
  updateMessage: string;

  @property({ type: String })
  sender!: 'you' | 'bot';

  @property({ type: String })
  detectedLanguage!: string;

  @property({ type: Number })
  clusterId!: number;

  @property({ type: String })
  type:
    | 'start'
    | 'error'
    | 'moderation_error'
    | 'info'
    | 'welcomeMessage'
    | 'message'
    | 'thinking'
    | 'noStreaming'
    | undefined;

  @property({ type: Boolean })
  spinnerActive = false;

  @property({ type: Boolean })
  fullReferencesOpen = false;

  @property({ type: String })
  followUpQuestionsRaw: string = '';

  @property({ type: Array })
  followUpQuestions: string[] = [];

  @property({ type: Boolean })
  jsonLoading = false;

  api: BaseChatBotServerApi;

  constructor() {
    super();
    this.api = new BaseChatBotServerApi();
  }

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to MarkdownDirective events
    this.addEventListener('jsonLoadingStart', this.handleJsonLoadingStart);
    this.addEventListener('jsonLoadingEnd', this.handleJsonLoadingEnd);
  }

  override disconnectedCallback() {
    // Remove event listeners for MarkdownDirective
    this.removeEventListener('jsonLoadingStart', this.handleJsonLoadingStart);
    this.removeEventListener('jsonLoadingEnd', this.handleJsonLoadingEnd);

    super.disconnectedCallback();
  }

  stopJsonLoading() {
    this.jsonLoading = false;
  }

  handleJsonLoadingStart = () => {
    console.log('JSON loading start event triggered');
    this.jsonLoading = true;
    this.requestUpdate(); // If needed to trigger a re-render
  };

  handleJsonLoadingEnd = (event: any) => {
    const jsonContent = event.detail;
    console.log(
      'JSON loading end event triggered with JSON content:',
      jsonContent
    );
    this.jsonLoading = false;
    let jsonContentParsed: CrtRefinedCausesReply | undefined = undefined;
    try {
      jsonContentParsed = JSON.parse(
        jsonContent.jsonContent
      ) as CrtRefinedCausesReply;
    } catch (e) {
      console.error('Error parsing JSON content:', e);
      try {
        jsonContentParsed = JSON.parse(jsonrepair(jsonContent.jsonContent));
      } catch (e) {
        console.error('Error parsing JSON content again:', e);
      }
    }
  };

  static override get styles() {
    return [
      super.styles,
      css`
        :host {
          display: flex;
        }
        .chatImage {
          padding: 8px;
          vertical-align: text-top;
        }

        .robotIcon {
          --md-icon-size: 34px;
        }

        .chatText {
          padding: 8px;
          padding-left: 8px;
          margin-top: 0;
          padding-top: 2px;
        }

        .chatTextUser {
        }

        .userChatDialog {
          color: var(--md-sys-color-on-surface);
          background-color: var(--md-sys-color-surface-container);
          padding: 8px;
          margin: 16px;
          line-height: 1.5;
          margin-bottom: 0px;
          border-radius: 12px;
        }

        .post {
          margin: 8px;
          padding: 12px;
          border-radius: 24px;
          margin-right: 0;
          background-color: var(--md-sys-color-secondary);
          color: var(--md-sys-color-on-secondary);
          cursor: pointer;
        }

        .refinedCausesSuggestionshowMore {
          padding-left: 16px;
          padding-right: 16px;
        }

        .postImage {
          height: 28px;
          width: 50px;
        }

        .postName {
          display: flex;
          justify-content: center;
          align-content: center;
          flex-direction: column;
          margin-right: 8px;
        }

        .chatGPTDialogContainer {
          max-width: 100%;
          width: 100%;
        }

        .chatGPTDialog {
          color: var(--md-sys-color-on-surface);
          background-color: var(--md-sys-color-surface);
          padding: 8px;
          margin: 16px;
          line-height: 1.5;
          margin-bottom: 0px;
          border-radius: 10px;
          max-width: 89%;
          margin-top: 12px;
        }

        @media (max-width: 800px) {
          .chatGPTDialog {
            margin: 8px;
            max-width: 100%;
          }
        }

        .chatGPTDialog[error] {
          background-color: var(--md-sys-color-error);
          color: var(--md-sys-color-on-error);
        }

        .followup-question-container {
          margin-top: 12px;
          width: 100%;
          align-self: flex-end;
          justify-content: flex-end;
          margin-right: 32px;
          width: 100%;
        }

        .labelText {
          padding-left: 6px;
          width: 100%;
        }

        md-circular-progress {
          --md-circular-progress-size: 32px;
          width: 32px;
          height: 32px;
          margin-top: 8px;
        }

        .refinedSuggestions {
          padding: 0;
          border-radius: 8px;
          margin: 16px;
          margin-top: 0;
        }

        .refinedSuggestions label {
          display: flex;
          align-items: center;
          margin-bottom: 0; // Reduced margin for a tighter layout
          padding: 8px;
        }

        .labelText {
          margin-left: 4px; // Adjust as needed
        }

        .refinedContainer {
          padding: 0;
        }

        .directCause {
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          margin-bottom: 16px !important;
          border-radius: 16px;
        }

        .assumption {
          background-color: var(--md-sys-color-secondary);
          color: var(--md-sys-color-on-secondary);
          margin-bottom: 16px !important;
          border-radius: 16px;
        }

        .assumptionCheckbox {
          --md-checkbox-outline-color: var(--md-sys-color-on-secondary);
          --md-checkbox-hover-outline-color: var(--md-sys-color-on-primary);
        }

        .directCauseCheckbox {
          --md-checkbox-outline-color: var(--md-sys-color-on-primary);
          --md-checkbox-hover-outline-color: var(--md-sys-color-on-secondary);
        }

        md-filled-button {
          max-width: 250px;
          margin-top: 16px;
          margin-bottom: 16px;
        }

        .refinedCausesSuggestions {
          margin-top: 8px;
          margin-left: 36px;
          margin-right: 36px;
          margin-bottom: 22px;
          padding: 8px;
          border-radius: 12px;
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }
        .followup-question {
          padding: 0;
          margin: 6px;
        }

        .chat-message {
          flex: 1;
        }

        .thinkingText {
          margin-top: 4px;
          margin-left: 6px;
          color: var(--md-sys-color-secondary);
        }

        .thinkingText[spinnerActive] {
          color: var(--md-sys-color-primary);
        }

        .doneIcon {
          margin-left: 16px;
          margin-right: 4px;
          color: var(--md-sys-color-secondary);
          font-size: 28px;
        }

        .postCitation {
          font-size: 9px;
          background-color: var(--md-sys-color-inverse-on-surface);
          color: var(--md-sys-color-primary);
          padding: 3px;
        }

        md-checkbox {
          margin: 15px;
        }

        .followUpQuestionMark {
          color: var(--md-sys-color-primary);
          font-size: 36px;
          margin-top: 8px;
        }

        .citationLink {
          margin-left: 8px;
          margin-bottom: 8px;
        }

        .progress-ring {
          transform: rotate(-90deg);
          color: var(--md-sys-color-secondary);
          transform-origin: 50% 50%;
          margin-left: 16px;
          margin-right: 4px;
        }
        .progress-ring__circle {
          stroke: var(--md-sys-color-primary);
          stroke-dasharray: 75.4;
          stroke-dashoffset: 75.4;
          stroke-linecap: round;
          animation: progress-ring 2.5s infinite;
        }
        @keyframes progress-ring {
          0% {
            stroke-dashoffset: 75.4;
          }
          50% {
            stroke-dashoffset: 0;
            transform: rotate(0deg);
          }
        }

        .suggestionsHeader {
          font-size: 18px;
          color: var(--md-sys-color-primary);
          margin-bottom: 16px;
        }

        .sourceFavIcon {
          margin-right: 8px;
        }

        .sourceButton {
          margin: 8px;
          padding: 8px;
          max-width: 250px;
          max-height: 60px;
          height: 60px;
          line-height: 1.2;
          white-space: collapse balance;
          font-size: 12px;
          --md-elevated-button-container-height: 60px !important;
          --md-elevated-button-hover-label-text-color: var(
            --md-sys-color-on-surface
          );
        }

        .sourceContainer {
          text-align: left;
        }

        a {
          color: var(--md-sys-color-primary);
         }
      `,
    ];
  }

  get isError() {
    return this.type == 'error' || this.type == 'moderation_error';
  }

  renderCGImage() {
    return html` <md-icon class="robotIcon">smart_toy</md-icon> `;
  }

  renderRoboImage() {
    return html` <md-icon class="robotIcon">person</md-icon> `;
  }

  renderJson() {
    return html``;
  }

  renderInfo() {
    if (this.wsMessage && this.wsMessage.data && this.wsMessage.data) {
      const data = this.wsMessage.data as PsRagDocumentSourcesWsData;
      if (data.name === 'sourceDocuments') {
        console.error(JSON.stringify(data));
        return html`<div
          class="layout horizontal  wrap sourceDocumentsContainer"
        >
          ${data.message.map(
            document => html`
              <md-elevated-button
                class="sourceButton"
                @click=${() => this.fire('ps-open-source-dialog', document)}
              >
                <div class="layout horizontal sourceContainer">
                  <img
                    src="https://www.google.com/s2/favicons?domain=${this.stripDomainForFacIcon(
                      document.url
                    )}&sz=24"
                    slot="icon"
                    width="24"
                    height="24"
                    class="sourceFavIcon"
                  />
                  <div class="documentShortDescription">
                    ${this.shortenText(
                      `${this.capitalizeFirstLetter(document.title)}: ${
                        document.description
                      }`,
                      65
                    )}
                  </div>
                </div>
              </md-elevated-button>
            `
          )}
        </div>`;
      } else {
        return nothing;
      }
    } else {
      return nothing;
    }
  }

  shortenText(text: string, maxLength: number) {
    if (text.length > maxLength) {
      return text.substr(0, maxLength) + '...';
    } else {
      return text;
    }
  }

  capitalizeFirstLetter(text: string): string {
    if (text.length === 0) return text;

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  stripDomainForFacIcon(url: string) {
    let domain = url.split('/')[2];
    console.error(`Domain is ${domain}`);
    return domain;
  }

  renderChatGPT(): any {
    return html`
      <div class="layout vertical chatGPTDialogContainer">
        <div
          class="chatGPTDialog layout vertical bot-message"
          ?error="${this.isError}"
        >
          <div class="layout ${this.wide ? 'horizontal' : 'vertical'}">
            <div class="layout vertical chatImage">${this.renderCGImage()}</div>
            <div class="layout vertical chatText">
              ${resolveMarkdown(this.message, {
                includeImages: true,
                includeCodeBlockClassNames: true,
                handleJsonBlocks: true,
                targetElement: this,
              })}
              ${this.jsonLoading
                ? html`<div class="layout horizontal center-center">
                    <md-circular-progress indeterminate></md-circular-progress>
                  </div>`
                : nothing}
            </div>
          </div>
          ${this.renderJson()}
        </div>
        ${this.followUpQuestions && this.followUpQuestions.length > 0
          ? html`
              <div class="layout horizontal followup-question-container wrap">
                <md-icon class="followUpQuestionMark">contact_support</md-icon
                >${this.followUpQuestions.map(
                  question => html`
                    <md-outlined-button
                      class="followup-question"
                      .label="${question}"
                      @click="${() => this.fire('followup-question', question)}"
                    ></md-outlined-button>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  parseFollowUpQuestions() {
    this.followUpQuestionsRaw = this.followUpQuestionsRaw.replace(
      /<<([^>>]+)>>/g,
      (match, content) => {
        this.followUpQuestions.push(content);
        return '';
      }
    );
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('followUpQuestionsRaw') &&
      this.followUpQuestionsRaw
    ) {
      this.parseFollowUpQuestions();
    }
  }

  renderUser(): any {
    return html`
      <div class="userChatDialog layout horizontal user-message">
        <div class="layout vertical chatImage">${this.renderRoboImage()}</div>
        <div class="layout vertical chatText chatTextUser">
          ${resolveMarkdown(this.message, {
            includeImages: true,
            includeCodeBlockClassNames: true,
            handleJsonBlocks: true,
            targetElement: this,
          })}
        </div>
      </div>
    `;
  }

  renderNoStreaming() {
    return html`${this.spinnerActive
        ? html`<svg class="progress-ring" width="28" height="28">
            <circle
              class="progress-ring__circle"
              ?spinnerActive="${this.spinnerActive}"
              stroke="blue"
              stroke-width="2"
              fill="transparent"
              r="10"
              cx="12"
              cy="12"
            />
          </svg>`
        : html`<md-icon class="doneIcon">done</md-icon>`}
      <div class="thinkingText" ?spinnerActive="${this.spinnerActive}">
        ${this.message}
        ${this.updateMessage ? html`- ${this.updateMessage}` : nothing}
      </div> `;
  }

  renderThinking() {
    return html`${this.spinnerActive
        ? html`<svg class="progress-ring" width="28" height="28">
            <circle
              class="progress-ring__circle"
              ?spinnerActive="${this.spinnerActive}"
              stroke="blue"
              stroke-width="2"
              fill="transparent"
              r="10"
              cx="12"
              cy="12"
            />
          </svg>`
        : html`<md-icon class="doneIcon">done</md-icon>`}
      <div class="thinkingText" ?spinnerActive="${this.spinnerActive}">
        ${this.getThinkingText()}
      </div> `;
  }

  getThinkingText() {
    //TODO: Fix this activate i18n
    if (this.detectedLanguage == 'es') {
      return 'Mõeldes...';
    } else if (this.detectedLanguage == 'is') {
      return 'Hugsa...';
    } else {
      return 'Thinking...';
    }
  }

  renderMessage() {
    if (this.sender === 'you') {
      return this.renderUser();
    } else if (this.sender === 'bot' && this.type === 'thinking') {
      return this.renderThinking();
    } else if (this.sender === 'bot' && this.type === 'noStreaming') {
      return this.renderNoStreaming();
    } else if (this.sender === 'bot' && this.type === 'info') {
      return this.renderInfo();
    } else if (this.sender === 'bot') {
      return this.renderChatGPT();
    }
  }

  override render() {
    return html` ${this.renderMessage()} `;
  }
}
