import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { Layouts } from '../../flexbox-literals/classes';
import { YpBaseElement } from '../../@yrpri/common/yp-base-element';
import { resolveMarkdown } from './litMarkdown.js';
import '@material/web/icon/icon.js';
import '@material/web/checkbox/checkbox.js';

import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/filled-text-field.js';

import '@material/web/progress/circular-progress.js';
import { jsonrepair } from 'jsonrepair';
import '../../@yrpri/common/yp-image.js';
import { LtpServerApi } from '../LtpServerApi';
import { json } from 'stream/consumers';
import { MdCheckbox } from '@material/web/checkbox/checkbox.js';

@customElement('ltp-ai-chat-element')
export class LtpAiChatElement extends YpBaseElement {
  @property({ type: String })
  message!: string;

  @property({ type: String })
  sender: 'you' | 'bot';

  @property({ type: String })
  detectedLanguage: string;

  @property({ type: String })
  parentNodeId!: string;

  @property({ type: String })
  crtId!: string;

  @property({ type: Number })
  clusterId: number;

  @property({ type: String })
  type:
    | 'start'
    | 'error'
    | 'moderation_error'
    | 'info'
    | 'message'
    | 'thinking'
    | undefined;

  @property({ type: Boolean })
  active = true;

  @property({ type: Boolean })
  fullReferencesOpen = false;

  @property({ type: String })
  followUpQuestionsRaw: string = '';

  @property({ type: Array })
  followUpQuestions: string[] = [];

  @property({ type: Array })
  refinedCausesSuggestions: string[] | undefined = undefined;

  @property({ type: Array })
  refinedAssumptionSuggestions: string[] | undefined = undefined;

  @property({ type: Boolean })
  jsonLoading = false;

  isCreatingCauses: boolean;

  api: LtpServerApi;

  constructor() {
    super();
    this.api = new LtpServerApi();
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
    let jsonContentParsed;
    try {
      jsonContentParsed = JSON.parse(jsonContent.jsonContent);
    } catch (e) {
      console.error('Error parsing JSON content:', e);
      try {
        jsonContentParsed = JSON.parse(jsonrepair(jsonContent.jsonContent));
      } catch (e) {
        console.error('Error parsing JSON content again:', e);
      }
    }

    if (jsonContentParsed) {
      if (jsonContentParsed.refinedCauses) {
        this.refinedCausesSuggestions = jsonContentParsed.refinedCauses;
      }
      if (jsonContentParsed.refinedAssumptions) {
        this.refinedAssumptionSuggestions =
          jsonContentParsed.refinedAssumptions;
      }
    }
  };

  static get styles() {
    return [
      Layouts,
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
          max-width: 75%;
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

        .refinedSuggestions  {
          padding: 16px;
        }

        .refinedSuggestions label {
          display: flex;
          align-items: center;
          margin-bottom: 0; // Reduced margin for a tighter layout
          padding: 8px;
        }

        .refinedSuggestions label.assumption:first-of-type {
          margin-top: 8px; // Extra margin for the first assumption
        }

        .labelText {
          margin-left: 4px; // Adjust as needed
        }

        .refinedContainer {
          padding: 8px;
          padding-left: 36px;
        }

        .directCause {
          background-color: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
        }

        .assumption {
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
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
      `,
    ];
  }

  async addSelected() {
    // Get all checked checkbox elements
    const checkboxes = this.shadowRoot.querySelectorAll('md-checkbox');

    // Arrays to hold selected causes and assumptions
    const selectedCauses: string[] = [];
    const selectedAssumptions: string[] = [];

    // Iterate over each checked checkbox
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const item = checkbox.getAttribute('aria-label');
        const type = (checkbox as MdCheckbox).dataset.type;

        if (type === 'directCause') {
          selectedCauses.push(item);
        } else if (type === 'assumption') {
          selectedAssumptions.push(item);
        }
      }
    });

    this.isCreatingCauses = true;

    // Add causes and assumptions using separate API calls
    let nodes: LtpCurrentRealityTreeDataNode[] = [];
    if (selectedCauses.length) {
      const causesNodes = await this.api.addDirectCauses(
        this.crtId,
        this.parentNodeId,
        selectedCauses,
        'directCause'
      );
      nodes = nodes.concat(causesNodes);
    }
    if (selectedAssumptions.length) {
      const assumptionsNodes = await this.api.addDirectCauses(
        this.crtId,
        this.parentNodeId,
        selectedAssumptions,
        'assumption'
      );
      nodes = nodes.concat(assumptionsNodes);
    }

    this.fireGlobal('add-nodes', {
      parentNodeId: this.parentNodeId,
      nodes,
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    this.fire('close-add-cause-dialog');

    this.isCreatingCauses = false;
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

  renderRefinedSuggestions() {
    const combinedSuggestions = [
      ...(this.refinedCausesSuggestions || []).map(suggestion => ({
        text: suggestion,
        type: 'directCause',
      })),
      ...(this.refinedAssumptionSuggestions || []).map(suggestion => ({
        text: suggestion,
        type: 'assumption',
      })),
    ];

    if (combinedSuggestions.length > 0) {
      return html`
        <div
          class="layout vertical refinedSuggestions wrap"
          role="group"
          aria-label="Refined suggestions"
        >
          ${combinedSuggestions.map(
            ({ text, type }) => html`
              <label
                class="layout horizontal refinedContainer ${type ===
                'directCause'
                  ? 'directCause'
                  : 'assumption'}"
              >
                <md-checkbox
                  aria-label="${text}"
                  data-type="${type}"
                  touch-target="wrapper"
                ></md-checkbox>
                <div class="labelText">${text}</div>
              </label>
            `
          )}
          <div class="layout horizontal center-center">
            <md-filled-button @click="${() => this.addSelected()}">
              ${this.t('Add selected')}
            </md-filled-button>
          </div>
        </div>
      `;
    } else {
      return nothing;
    }
  }

  renderChatGPT(): any {
    console.error(
      `renderChatGPT refinedCausesSuggestions`,
      JSON.stringify(this.refinedCausesSuggestions, null, 2)
    );
    return html`
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
                ? html`<div class="layout horizontal center-center">
                    <md-circular-progress indeterminate></md-circular-progress>
                  </div>`
                : nothing}
            </div>
          </div>
          ${this.renderRefinedSuggestions()}
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

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('followUpQuestionsRaw') &&
      this.followUpQuestionsRaw
    ) {
      this.parseFollowUpQuestions();
    }
  }

  renderUser() {
    return html`
      <div class="userChatDialog layout horizontal user-message">
        <div class="layout vertical chatImage">${this.renderRoboImage()}</div>
        <div class="layout vertical chatText chatTextUser">${this.message}</div>
      </div>
    `;
  }

  renderThinking() {
    return html`${this.active
        ? html`<svg class="progress-ring" width="28" height="28">
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
        : html`<md-icon class="doneIcon">done</md-icon>`}
      <div class="thinkingText" ?active="${this.active}">
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
    } else if (this.sender === 'bot') {
      return this.renderChatGPT();
    }
  }

  render() {
    return html` ${this.renderMessage()} `;
  }
}
