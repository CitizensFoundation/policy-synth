var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveMarkdown } from './litMarkdown.js';
import '@material/web/icon/icon.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/progress/circular-progress.js';
import { jsonrepair } from 'jsonrepair';
import '@yrpri/webapp/common/yp-image.js';
import { BaseChatBotServerApi } from './BaseChatBotApi';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
let PsAiChatElement = class PsAiChatElement extends YpBaseElement {
    constructor() {
        super();
        this.active = true;
        this.fullReferencesOpen = false;
        this.followUpQuestionsRaw = '';
        this.followUpQuestions = [];
        this.jsonLoading = false;
        this.handleJsonLoadingStart = () => {
            console.log('JSON loading start event triggered');
            this.jsonLoading = true;
            this.requestUpdate(); // If needed to trigger a re-render
        };
        this.handleJsonLoadingEnd = (event) => {
            const jsonContent = event.detail;
            console.log('JSON loading end event triggered with JSON content:', jsonContent);
            this.jsonLoading = false;
            let jsonContentParsed = undefined;
            try {
                jsonContentParsed = JSON.parse(jsonContent.jsonContent);
            }
            catch (e) {
                console.error('Error parsing JSON content:', e);
                try {
                    jsonContentParsed = JSON.parse(jsonrepair(jsonContent.jsonContent));
                }
                catch (e) {
                    console.error('Error parsing JSON content again:', e);
                }
            }
        };
        this.api = new BaseChatBotServerApi();
    }
    connectedCallback() {
        super.connectedCallback();
        // Subscribe to MarkdownDirective events
        this.addEventListener('jsonLoadingStart', this.handleJsonLoadingStart);
        this.addEventListener('jsonLoadingEnd', this.handleJsonLoadingEnd);
    }
    disconnectedCallback() {
        // Remove event listeners for MarkdownDirective
        this.removeEventListener('jsonLoadingStart', this.handleJsonLoadingStart);
        this.removeEventListener('jsonLoadingEnd', this.handleJsonLoadingEnd);
        super.disconnectedCallback();
    }
    stopJsonLoading() {
        this.jsonLoading = false;
    }
    static get styles() {
        return [
            super.styles,
            css `
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
          padding-top: 12px;
        }

        .userChatDialog {
          color: var(--md-sys-color-on-primary);
          background-color: var(--md-sys-color-primary);
          padding: 8px;
          margin: 16px;
          line-height: 1.35;
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
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          padding: 8px;
          margin: 16px;
          line-height: 1.35;
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

        .thinkingText[active] {
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
      `,
        ];
    }
    get isError() {
        return this.type == 'error' || this.type == 'moderation_error';
    }
    renderCGImage() {
        return html ` <md-icon class="robotIcon">smart_toy</md-icon> `;
    }
    renderRoboImage() {
        return html ` <md-icon class="robotIcon">person</md-icon> `;
    }
    renderJson() {
        return html ``;
    }
    renderChatGPT() {
        return html `
      <div class="layout vertical chatGPTDialogContainer">
        <div
          class="chatGPTDialog layout vertical bot-message"
          ?error="${this.isError}"
        >
          <div class="layout horizontal">
            <div class="layout vertical chatImage">${this.renderCGImage()}</div>
            <div class="layout vertical chatText">
              ${resolveMarkdown(this.message, {
            includeImages: true,
            includeCodeBlockClassNames: true,
            handleJsonBlocks: true,
            targetElement: this,
        })}
              ${this.jsonLoading
            ? html `<div class="layout horizontal center-center">
                    <md-circular-progress indeterminate></md-circular-progress>
                  </div>`
            : nothing}
            </div>
          </div>
          ${this.renderJson()}
        </div>
        ${this.followUpQuestions && this.followUpQuestions.length > 0
            ? html `
              <div class="layout horizontal followup-question-container wrap">
                <md-icon class="followUpQuestionMark">contact_support</md-icon
                >${this.followUpQuestions.map(question => html `
                    <md-outlined-button
                      class="followup-question"
                      .label="${question}"
                      @click="${() => this.fire('followup-question', question)}"
                    ></md-outlined-button>
                  `)}
              </div>
            `
            : nothing}
      </div>
    `;
    }
    parseFollowUpQuestions() {
        this.followUpQuestionsRaw = this.followUpQuestionsRaw.replace(/<<([^>>]+)>>/g, (match, content) => {
            this.followUpQuestions.push(content);
            return '';
        });
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('followUpQuestionsRaw') &&
            this.followUpQuestionsRaw) {
            this.parseFollowUpQuestions();
        }
    }
    renderUser() {
        return html `
      <div class="userChatDialog layout horizontal user-message">
        <div class="layout vertical chatImage">${this.renderRoboImage()}</div>
        <div class="layout vertical chatText chatTextUser">${this.message}</div>
      </div>
    `;
    }
    renderNoStreaming() {
        return html `${this.active
            ? html `<svg class="progress-ring" width="28" height="28">
            <circle
              class="progress-ring__circle"
              ?active="${this.active}"
              stroke="blue"
              stroke-width="2"
              fill="transparent"
              r="10"
              cx="12"
              cy="12"
            />
          </svg>`
            : html `<md-icon class="doneIcon">done</md-icon>`}
      <div class="thinkingText" ?active="${this.active}">
        ${this.message}
        ${this.updateMessage ? html `- ${this.updateMessage}` : nothing}
      </div> `;
    }
    renderThinking() {
        return html `${this.active
            ? html `<svg class="progress-ring" width="28" height="28">
            <circle
              class="progress-ring__circle"
              ?active="${this.active}"
              stroke="blue"
              stroke-width="2"
              fill="transparent"
              r="10"
              cx="12"
              cy="12"
            />
          </svg>`
            : html `<md-icon class="doneIcon">done</md-icon>`}
      <div class="thinkingText" ?active="${this.active}">
        ${this.getThinkingText()}
      </div> `;
    }
    getThinkingText() {
        //TODO: Fix this activate i18n
        if (this.detectedLanguage == 'es') {
            return 'Mõeldes...';
        }
        else if (this.detectedLanguage == 'is') {
            return 'Hugsa...';
        }
        else {
            return 'Thinking...';
        }
    }
    renderMessage() {
        if (this.sender === 'you') {
            return this.renderUser();
        }
        else if (this.sender === 'bot' && this.type === 'thinking') {
            return this.renderThinking();
        }
        else if (this.sender === 'bot' && this.type === 'noStreaming') {
            return this.renderNoStreaming();
        }
        else if (this.sender === 'bot') {
            return this.renderChatGPT();
        }
    }
    render() {
        return html ` ${this.renderMessage()} `;
    }
};
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "message", void 0);
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "updateMessage", void 0);
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "sender", void 0);
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "detectedLanguage", void 0);
__decorate([
    property({ type: Number })
], PsAiChatElement.prototype, "clusterId", void 0);
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "type", void 0);
__decorate([
    property({ type: Boolean })
], PsAiChatElement.prototype, "active", void 0);
__decorate([
    property({ type: Boolean })
], PsAiChatElement.prototype, "fullReferencesOpen", void 0);
__decorate([
    property({ type: String })
], PsAiChatElement.prototype, "followUpQuestionsRaw", void 0);
__decorate([
    property({ type: Array })
], PsAiChatElement.prototype, "followUpQuestions", void 0);
__decorate([
    property({ type: Boolean })
], PsAiChatElement.prototype, "jsonLoading", void 0);
PsAiChatElement = __decorate([
    customElement('ps-ai-chat-element')
], PsAiChatElement);
export { PsAiChatElement };
//# sourceMappingURL=ps-ai-chat-element.js.map