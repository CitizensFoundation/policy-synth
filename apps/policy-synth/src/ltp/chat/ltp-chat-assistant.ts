import { css, html } from 'lit';
import { property, customElement, query, queryAll } from 'lit/decorators.js';
import {
  virtualize,
  virtualizerRef,
} from '@lit-labs/virtualizer/virtualize.js';

import { Layouts } from '../../flexbox-literals/classes';
import { YpBaseElement } from '../../@yrpri/common/yp-base-element';

import '@material/web/fab/fab.js';

//import '@material/web/formfield/formfield.js';
import '@material/web/radio/radio.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';

import '@material/web/iconbutton/outlined-icon-button.js';

import '../../@yrpri/common/yp-image.js';
import { LtpAiChatElement } from './ltp-ai-chat-element.js';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import './ltp-ai-chat-element.js';
import { LtpServerApi } from '../LtpServerApi';
import { last } from 'lodash';

const USE_WS = false;

const PROMPT_DEBUG = true;

@customElement('ltp-chat-assistant')
export class LtpChatAssistant extends YpBaseElement {
  @property({ type: Array })
  chatLog: LtpAiChatWsMessage[] = [];

  @property({ type: String })
  infoMessage: string;

  @property({ type: String })
  wsClientId!: string;

  @property({ type: Object })
  crtData!: LtpCurrentRealityTreeData;

  @property({ type: Object })
  nodeToAddCauseTo!: LtpCurrentRealityTreeDataNode;

  @property({ type: String })
  defaultInfoMessage: string =
    "I'm your Current Reality Tree assistant. I'm here to help to identify a direct causes of: ";

  @property({ type: String })
  wsEndpoint: string;

  @property({ type: Object })
  ws!: WebSocket;

  @property({ type: Boolean })
  inputIsFocused = false;

  @property({ type: Number })
  clusterId: number;

  @property({ type: Number })
  communityId: number;

  @property({ type: String })
  textInputLabel: string;

  @property({ type: String })
  currentFollowUpQuestions: string = '';

  @query('#sendButton')
  sendButton: MdFilledTonalButton;

  @queryAll('ltp-ai-chat-element')
  chatElements: LtpAiChatElement[];

  @query('#chatInput')
  chatInputField: MdOutlinedTextField;

  @query('#chat-window')
  chatWindow: HTMLElement;

  api: LtpServerApi;

  constructor() {
    super();
    this.api = new LtpServerApi();
  }

  calcVH() {
    const vH = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    this.chatWindow.setAttribute('style', 'height:' + vH + 'px;');
  }

  handleCtrlPKeyPress(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'c') {
      this.copyLatestDebugInfoToClipboard();
      event.preventDefault();
    }
  }

  copyLatestDebugInfoToClipboard() {
    const latestChatMessage = this.chatLog[this.chatLog.length - 1];
    if (latestChatMessage && latestChatMessage.debug) {
      const systemPrompt =
        latestChatMessage.debug.systemPromptUsedForGeneration || '';
      const firstUserPrompt =
        latestChatMessage.debug.firstUserMessageUserForGeneration || '';
      const debugInfo = `${systemPrompt}\n\n-------------------------\n\n${firstUserPrompt}`;

      navigator.clipboard
        .writeText(debugInfo)
        .then(() => console.log('Debug info copied to clipboard!'))
        .catch(err => console.error('Failed to copy debug info:', err));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.defaultInfoMessage += `**${this.nodeToAddCauseTo.description}**`;
    console.error(this.defaultInfoMessage);

    if (PROMPT_DEBUG) {
      document.addEventListener('keydown', this.handleCtrlPKeyPress.bind(this));
    }

    let wsEndpoint;

    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '192.1.168'
    ) {
      wsEndpoint = `ws://${window.location.hostname}:8000`;
    } else {
      wsEndpoint = `wss://${window.location.hostname}:443`;
    }

    this.ws = new WebSocket(wsEndpoint);

    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onopen = this.onWsOpen.bind(this);
    this.ws.onerror = error => {
      console.error('WebSocket Error ' + error);
    };
  }

  onWsOpen() {
    // Assuming the server sends the clientId immediately after connection
    this.ws.onmessage = messageEvent => {
      const data = JSON.parse(messageEvent.data);
      if (data.clientId) {
        this.wsClientId = data.clientId;
        this.ws.onmessage = this.onMessage.bind(this); // Reset the onmessage handler
      }
    };
    this.reset();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('themeDarkMode')) {
    }
  }

  disconnectedCallback(): void {
    //    this.ws.close();
    super.disconnectedCallback();

    if (PROMPT_DEBUG) {
      document.removeEventListener(
        'keydown',
        this.handleCtrlPKeyPress.bind(this)
      );
    }
  }

  async onMessage(event: MessageEvent) {
    const data: LtpAiChatWsMessage = JSON.parse(event.data);
    console.error(event.data);

    switch (data.sender) {
      case 'bot':
        this.addChatBotElement(data);
        break;
      case 'you':
        this.addChatUserElement(data);
        break;
    }

    if (data.type !== 'stream_followup') {
      this.scrollDown();
    }
  }

  scrollDown() {
    //await this.updateComplete;
    setTimeout(() => {
      this.$$('#chat-messages').scrollTop =
        this.$$('#chat-messages').scrollHeight;
    }, 100);
  }

  addToChatLogWithMessage(
    data: LtpAiChatWsMessage,
    message: string | undefined = undefined,
    changeButtonDisabledState: boolean | undefined = undefined,
    changeButtonLabelTo: string | undefined = undefined,
    refinedCausesSuggestions: string[] | undefined = undefined,
    rawMessage: string | undefined = undefined
  ) {
    this.infoMessage = message;
    data.refinedCausesSuggestions = refinedCausesSuggestions || [];
    data.rawMessage = data.rawMessage || rawMessage;
    this.chatLog = [...this.chatLog, data];

    this.requestUpdate();

    if (changeButtonDisabledState !== undefined) {
      this.sendButton.disabled = changeButtonDisabledState;
    }

    if (changeButtonLabelTo !== undefined) {
      this.sendButton.innerHTML = changeButtonLabelTo;
    }
  }

  addChatBotElement(data: LtpAiChatWsMessage) {
    const lastElement = this.chatElements[this.chatElements.length - 1];
    switch (data.type) {
      case 'hello_message':
        this.addToChatLogWithMessage(data);
        break;
      case 'thinking':
        if (lastElement) {
          lastElement.active = true;
        }
        this.addToChatLogWithMessage(data, this.t('Thinking...'));
        break;
      case 'start':
        if (lastElement) {
          lastElement.active = false;
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
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = this.t('Send');
        this.infoMessage = this.defaultInfoMessage;
        debugger;
        break;
      case 'message':
        if (lastElement) {
          lastElement.active = false;
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
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = this.t('Send');
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

  addChatUserElement(data: LtpAiChatWsMessage) {
    this.chatLog = [...this.chatLog, data];
  }

  async sendChatMessage() {
    const message = this.chatInputField.value;

    if (message.length === 0) return;

    //this.ws.send(message);
    this.chatInputField.value = '';
    this.sendButton.disabled = false;
    this.sendButton.innerHTML = this.t('Thinking...');
    setTimeout(() => {
      this.chatInputField.blur();
    });

    this.addChatBotElement({
      sender: 'you',
      type: 'start',
      message: message,
    });

    this.addChatBotElement({
      sender: 'bot',
      type: 'thinking',
      message: '',
    });

    await this.api.sendGetRefinedCauseQuery(
      this.crtData.id,
      this.nodeToAddCauseTo.id,
      this.chatLog,
      this.wsClientId
    );
  }

  static get styles() {
    return [
      Layouts,
      css`
        md-textfield {
          width: 600px;
          --mdc-theme-primary: var(--md-sys-color-primary);
          --mdc-text-field-ink-color: var(--md-sys-color-on-surface);
          --mdc-text-area-outlined-hover-border-color: var(
            --md-sys-color-on-surface
          );
          --mdc-text-area-outlined-idle-border-color: var(
            --md-sys-color-on-surface
          );
          --mdc-notched-outline-border-color: var(
            --md-sys-color-on-surface-variant
          );
        }

        md-outlined-text-field {
          width: 350px;
        }

        .infoMessage {
          margin-top: 8px;
        }

        .chat-window {
          display: flex;
          flex-direction: column;
          height: 75vh;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          border-radius: 10px;
          overflow: hidden;
        }
        .chat-messages {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 20px;
          overflow-y: scroll;
        }

        .you-chat-element {
          align-self: flex-end;
          max-width: 80%;
          justify-content: flex-end;
          margin-right: 32px;
        }

        .bot-chat-element {
          align-self: flex-start;
          justify-content: flex-start;
          width: 100%;
          max-width: 100%;
        }

        .chat-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
        }

        @media (max-width: 600px) {
          .chat-window {
            height: 100%;
          }

          .you-chat-element {
            margin-right: 0;
          }
        }

        md-tonal-button {
          padding: 16px;
          padding-left: 0;
          margin-top: 0;
        }

        .sendIcon {
          cursor: pointer;
        }

        .restartButton {
          margin-left: 16px;
        }

        .darkModeButton {
          margin-right: 16px;
        }

        md-outlined-text-field {
          flex: 1;
          border-radius: 10px;
          border: none;
          padding: 10px;
          margin: 16px;
          margin-bottom: 16px;
          margin-left: 8px;
          margin-right: 8px;
          width: 650px;
        }

        @media (max-width: 960px) {
          .restartButton {
            margin-left: 8px;
            display: none;
          }

          yp-ai-chat-element[thinking] {
            margin-top: 12px;
          }

          .darkModeButton {
            margin-right: 8px;
            display: none;
          }

          md-outlined-text-field {
            transition: transform 0.5s;
            width: 400px;
          }

          .restartButton[input-is-focused] {
          }

          .darkModeButton[input-is-focused] {
          }

          md-outlined-text-field[focused] {
            width: 100%;
          }
        }

        @media (max-width: 450px) {
          md-outlined-text-field {
            width: 350px;
          }

          md-outlined-text-field[focused] {
            width: 100%;
          }
        }

        @media (max-width: 400px) {
          md-outlined-text-field {
            width: 320px;
          }

          md-outlined-text-field[focused] {
            width: 100%;
          }
        }
      `,
    ];
  }

  followUpQuestion(event: CustomEvent) {
    this.chatInputField.value = event.detail;
    this.sendChatMessage();
  }

  reset() {
    this.chatLog = [];
    this.ws.send('<|--reset-chat--|>');
  }

  toggleDarkMode() {
    this.themeDarkMode = !this.themeDarkMode;
    this.fire('theme-dark-mode', this.themeDarkMode);
    this.requestUpdate();
  }

  renderChatInput() {
    return html`
      <md-outlined-text-field
        class="textInput"
        hasTrailingIcon
        id="chatInput"
        @focus="${() => (this.inputIsFocused = true)}"
        @blur="${() => (this.inputIsFocused = true)}"
        @keyup="${(e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            this.sendChatMessage();
          }
        }}"
        .label="${this.textInputLabel}"
      >
        <md-icon
          class="sendIcon"
          @click="${this.sendChatMessage}"
          slot="trailing-icon"
          id="sendButton"
          ?input-is-focused="${this.inputIsFocused}"
          >send</md-icon
        >
      </md-outlined-text-field>
    `;
  }

  render() {
    return html`
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ltp-ai-chat-element
            class="bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="info"
            sender="bot"
          ></ltp-ai-chat-element>
          ${this.chatLog.map(
            chatElement => html`
              <ltp-ai-chat-element
                ?thinking="${chatElement.type === 'thinking'}"
                @followup-question="${this.followUpQuestion}"
                .clusterId="${this.clusterId}"
                class="${chatElement.sender}-chat-element"
                .detectedLanguage="${this.language}"
                .message="${chatElement.message}"
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
