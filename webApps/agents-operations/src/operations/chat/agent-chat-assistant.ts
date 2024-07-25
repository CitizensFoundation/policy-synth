import { PropertyValueMap, css, html } from 'lit';
import { property, customElement, query, queryAll } from 'lit/decorators.js';

import '@material/web/fab/fab.js';

import '@material/web/radio/radio.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';

import '@material/web/iconbutton/outlined-icon-button.js';

import '@yrpri/webapp/common/yp-image.js';
import { LtpAiChatElement } from './agent-ai-chat-element.js';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import './agent-ai-chat-element.js';
import { PsServerApi } from '../PsServerApi.js';
import { PsChatAssistant } from '../../chatBot/ps-chat-assistant.js';

const PROMPT_DEBUG = true;

@customElement('ltp-chat-assistant')
export class LtpChatAssistant extends PsChatAssistant {
  @property({ type: Object })
  crtData!: LtpCurrentRealityTreeData;

  @property({ type: Object })
  nodeToAddCauseTo!: LtpCurrentRealityTreeDataNode;

  @property({ type: String })
  defaultInfoMessage: string =
    "I'm your Current Reality Tree assistant. I'm here to help to identify direct causes of: ";

  @property({ type: Boolean })
  lastChainCompletedAsValid = false;

  @queryAll('ltp-ai-chat-element')
  chatElements?: LtpAiChatElement[];

  @property({ type: Array })
  lastCausesToValidate: string[] | undefined;

  @property({ type: Array })
  lastValidatedCauses: string[] | undefined;

  api: PsServerApi;
  heartbeatInterval: number | undefined;

  defaultDevWsPort = 8000;

  constructor() {
    super();
    this.api = new PsServerApi();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultInfoMessage += `**${this.nodeToAddCauseTo.description}**`;
  }

  async addChatBotElement(data: PsAiChatWsMessage) {
    const lastElement = this.chatElements![this.chatElements!.length - 1];

    switch (data.type) {
      case 'hello_message':
        this.addToChatLogWithMessage(data);
        break;
      case 'thinking':
        if (lastElement) {
          lastElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(data, this.t('Thinking...'));
        break;
      case 'noStreaming':
        if (lastElement) {
          lastElement.spinnerActive = true;
        }
        this.addToChatLogWithMessage(data, data.message);
        break;
      case 'agentStart':
        if (lastElement) {
          lastElement.spinnerActive = false;
        }
        const startOptions = data.message as unknown as PsAgentStartWsOptions;

        setTimeout(() => {
          this.scrollDown();
        }, 50);

        if (startOptions.noStreaming) {
          this.addChatBotElement({
            sender: 'bot',
            type: 'noStreaming',
            message: startOptions.name,
          });
        } else {
          this.addToChatLogWithMessage(data, startOptions.name);
          this.chatLog[
            this.chatLog.length - 1
          ].message = `${startOptions.name}\n\n`;
        }
        this.requestUpdate();
        break;
      case 'agentCompleted':
        if (lastElement) {
          lastElement.spinnerActive = false;
        }
        this.lastChainCompletedAsValid = false;
        this.lastValidatedCauses = undefined;

        const completedOptions =
          data.message as unknown as PsAgentCompletedWsOptions;
        if (
          completedOptions.results.lastAgent ||
          (completedOptions.results.validationErrors &&
            completedOptions.results.validationErrors.length > 0)
        ) {
          this.getSuggestionsFromValidation(
            completedOptions.name,
            completedOptions.results
          );
        }
        if (
          completedOptions.results.isValid &&
          completedOptions.results.lastAgent
        ) {
          this.lastChainCompletedAsValid = true;
          this.lastValidatedCauses = this.lastCausesToValidate;
        }
        break;
      case 'start':
        if (lastElement) {
          lastElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(data, this.t('Thinking...'));
        if (!this.chatLog[this.chatLog.length - 1].message)
          this.chatLog[this.chatLog.length - 1].message = '';
        break;
      case 'start_followup':
        lastElement.followUpQuestionsRaw = '';
        break;
      case 'stream_followup':
        lastElement.followUpQuestionsRaw += data.message;
        this.requestUpdate();
        break;
      case 'info':
        this.infoMessage = data.message;
        break;
      case 'moderation_error':
        data.message =
          'OpenAI Moderation Flag Error. Please refine your question.';
        this.addToChatLogWithMessage(data, data.message, false, this.t('Send'));
        break;
      case 'error':
        this.addToChatLogWithMessage(data, data.message, false, this.t('Send'));
        break;
      case 'end':
        lastElement.stopJsonLoading();
        this.chatLog[this.chatLog.length - 1].debug = data.debug;
        this.sendButton!.disabled = false;
        this.sendButton!.innerHTML = this.t('Send');
        this.infoMessage = this.defaultInfoMessage;
        break;
      case 'message':
        if (lastElement) {
          lastElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(
          data,
          data.message,
          undefined,
          undefined,
          data.refinedCausesSuggestions
        );
        this.chatLog[this.chatLog.length - 1].refinedCausesSuggestions =
          data.refinedCausesSuggestions;
        this.sendButton!.disabled = false;
        this.sendButton!.innerHTML = this.t('Send');
        this.infoMessage = this.defaultInfoMessage;
        this.requestUpdate();
        break;
      case 'stream':
        if (data.message && data.message != 'undefined') {
          //@ts-ignore
          this.infoMessage = this.t('typing');
          this.chatLog[this.chatLog.length - 1].message =
            this.chatLog[this.chatLog.length - 1].message + data.message;
          //console.error(this.chatLog[this.chatLog.length - 1].message)
          this.requestUpdate();
          break;
        }
    }

    this.scrollDown();
  }

  async sendChatMessage() {
    const message = this.chatInputField!.value;

    if (message.length === 0) return;

    //this.ws.send(message);
    this.chatInputField!.value = '';
    this.sendButton!.disabled = false;
    //this.sendButton!.innerHTML = this.t('Thinking...');
    setTimeout(() => {
      this.chatInputField!.blur();
    });

    const effect = this.nodeToAddCauseTo.description;

    let causes = message
      .split('\n')
      .map(cause => cause.trim())
      .filter(cause => cause !== '');

    let firstUserMessage = `Effect: ${effect}\n`;
    causes.forEach((cause, index) => {
      firstUserMessage += `Cause ${index + 1}: ${cause}\n`;
    });

    this.addChatBotElement({
      sender: 'you',
      type: 'start',
      message: this.chatLog.length === 0 ? firstUserMessage : message,
    });

    if (this.chatLog.length === 1) {
      this.lastCausesToValidate = causes;
      await this.api.runValidationChain(
        this.crtData.id!,
        this.nodeToAddCauseTo.id,
        this.chatLog,
        this.wsClientId,
        effect,
        causes
      );
    } else {
      this.addChatBotElement({
        sender: 'bot',
        type: 'thinking',
        message: '',
      });

      this.lastChainCompletedAsValid = false;

      await this.api.sendGetRefinedCauseQuery(
        this.crtData.id!,
        this.nodeToAddCauseTo.id,
        this.chatLog,
        this.wsClientId
      );
    }
  }

  async validateSelectedChoices(event: CustomEvent) {
    const causes = event.detail;
    this.lastCausesToValidate = causes;

    await this.api.runValidationChain(
      this.crtData.id!,
      this.nodeToAddCauseTo.id,
      this.chatLog,
      this.wsClientId,
      this.nodeToAddCauseTo.description,
      causes
    );
  }

  async getSuggestionsFromValidation(
    agentName: string,
    validationResults: PsValidationAgentResult
  ) {
    let effect;
    effect = this.nodeToAddCauseTo.description;

    let userMessage = `Expert: ${agentName}

Effect: ${this.nodeToAddCauseTo?.description}\n`;
    this.lastCausesToValidate!.forEach((cause, index) => {
      userMessage += `Cause ${index + 1}: ${cause}\n`;
    });

    userMessage += `Expert Validation Results:\n`;

    userMessage += JSON.stringify(validationResults, null, 2);

    this.addChatBotElement({
      sender: 'you',
      type: 'start',
      message: userMessage,
    });

    this.chatLog[this.chatLog.length - 1].hidden = true;

    this.addChatBotElement({
      sender: 'bot',
      type: 'thinking',
      message: '',
    });

    await this.api.sendGetRefinedCauseQuery(
      this.crtData.id!,
      this.nodeToAddCauseTo.id,
      this.chatLog,
      this.wsClientId
    );
  }

  renderChatInput() {
    return html`
      ${this.onlyUseTextField || this.chatLog.length > 1
        ? html`
            <md-outlined-text-field
              class="textInput"
              type="text"
              hasTrailingIcon
              id="chatInput"
              rows="${this.chatLog.length > 1 ? '1' : '3'}"
              @focus="${() => (this.inputIsFocused = true)}"
              @blur="${() => (this.inputIsFocused = true)}"
              @keyup="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.sendChatMessage();
                }
              }}"
              .label="${this.textInputLabel}"
              ><md-icon
                class="sendIcon"
                @click="${this.sendChatMessage}"
                slot="trailing-icon"
                id="sendButton"
                ?input-is-focused="${this.inputIsFocused}"
                >send</md-icon
              >
            </md-outlined-text-field>
          `
        : html`<md-outlined-text-field
            class="textInput"
            type="textarea"
            hasTrailingIcon
            id="chatInput"
            rows="${this.chatLog.length > 1 ? '1' : '3'}"
            @focus="${() => (this.inputIsFocused = true)}"
            @blur="${() => (this.inputIsFocused = true)}"
            .label="${this.textInputLabel}"
            ><md-icon
              class="sendIcon"
              @click="${this.sendChatMessage}"
              slot="trailing-icon"
              id="sendButton"
              ?input-is-focused="${this.inputIsFocused}"
              >send</md-icon
            ></md-outlined-text-field
          >`}
    `;
  }

  override render() {
    return html`
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ltp-ai-chat-element
            class="chatElement bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="info"
            sender="bot"
          ></ltp-ai-chat-element>
          ${this.chatLog
            .filter(chatElement => !chatElement.hidden)
            .map(
              chatElement => html`
                <ltp-ai-chat-element
                  ?thinking="${chatElement.type === 'thinking' ||
                  chatElement.type === 'noStreaming'}"
                  @followup-question="${this.followUpQuestion}"
                  @validate-selected-causes="${this.validateSelectedChoices}"
                  .clusterId="${this.clusterId}"
                  class="chatElement ${chatElement.sender}-chat-element"
                  .detectedLanguage="${this.language}"
                  .message="${chatElement.message}"
                  @scroll-down-enabled="${() => (this.userScrolled = false)}"
                  .lastChainCompletedAsValid="${this.lastChainCompletedAsValid}"
                  .lastValidatedCauses="${this.lastValidatedCauses}"
                  .crtId="${this.crtData.id}"
                  .parentNodeId="${this.nodeToAddCauseTo.id}"
                  .type="${chatElement.type}"
                  .sender="${chatElement.sender}"
                ></ltp-ai-chat-element>
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
