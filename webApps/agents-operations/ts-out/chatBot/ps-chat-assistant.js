var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from 'lit';
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
import { BaseChatBotServerApi } from './BaseChatBotApi.js';
import './ps-ai-chat-element.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
const PROMPT_DEBUG = true;
let PsChatAssistant = class PsChatAssistant extends YpBaseElement {
    constructor() {
        super();
        this.chatLog = [];
        this.webSocketsErrorCount = 0;
        this.defaultInfoMessage = "I'm your friendly chat assistant";
        this.inputIsFocused = false;
        this.onlyUseTextField = false;
        this.userScrolled = false;
        this.currentFollowUpQuestions = '';
        this.programmaticScroll = false;
        this.showCleanupButtonAtBottom = false;
        this.scrollStart = 0;
        this.defaultDevWsPort = 8000;
        this.api = new BaseChatBotServerApi();
    }
    calcVH() {
        const vH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        this.chatWindow.setAttribute('style', 'height:' + vH + 'px;');
    }
    handleCtrlPKeyPress(event) {
        if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'c') {
            this.copyLatestDebugInfoToClipboard();
            event.preventDefault();
        }
    }
    copyLatestDebugInfoToClipboard() {
        const latestChatMessage = this.chatLog[this.chatLog.length - 1];
        if (latestChatMessage && latestChatMessage.debug) {
            const systemPrompt = latestChatMessage.debug.systemPromptUsedForGeneration || '';
            const firstUserPrompt = latestChatMessage.debug.firstUserMessageUserForGeneration || '';
            const debugInfo = `${systemPrompt}\n\n-------------------------\n\n${firstUserPrompt}`;
            navigator.clipboard
                .writeText(debugInfo)
                .then(() => console.log('Debug info copied to clipboard!'))
                .catch(err => console.error('Failed to copy debug info:', err));
        }
    }
    connectedCallback() {
        super.connectedCallback();
        const a = { name: 'test' };
        if (PROMPT_DEBUG) {
            document.addEventListener('keydown', this.handleCtrlPKeyPress.bind(this));
        }
        this.initWebSockets();
    }
    initWebSockets() {
        let wsEndpoint;
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '192.1.168') {
            wsEndpoint = `ws://${window.location.hostname}:${this.defaultDevWsPort}`;
        }
        else {
            wsEndpoint = `wss://${window.location.hostname}:443`;
        }
        try {
            this.ws = new WebSocket(wsEndpoint);
            console.error('WebSocket Opened');
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onopen = this.onWsOpen.bind(this);
            this.ws.onerror = error => {
                //TODO: Try to resend the last message
                this.webSocketsErrorCount++;
                console.error('WebSocket Error ' + error);
                setTimeout(() => this.initWebSockets(), this.webSocketsErrorCount > 1
                    ? this.webSocketsErrorCount * 1000
                    : 2000);
            };
            this.ws.onclose = error => {
                console.error('WebSocket Close ' + error);
                this.webSocketsErrorCount++;
                setTimeout(() => this.initWebSockets(), this.webSocketsErrorCount > 1
                    ? this.webSocketsErrorCount * 1000
                    : 2000);
            };
        }
        catch (error) {
            console.error('WebSocket Error ' + error);
            this.webSocketsErrorCount++;
            setTimeout(() => this.initWebSockets(), this.webSocketsErrorCount > 1 ? this.webSocketsErrorCount * 1000 : 1500);
        }
    }
    firstUpdated(_changedProperties) {
        // focus the text input
        setTimeout(() => {
            this.chatInputField.focus();
        }, 420);
        setTimeout(() => {
            this.chatMessagesElement.addEventListener('scroll', this.handleScroll.bind(this));
        }, 500);
    }
    sendHeartbeat() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
        else {
            console.error('WebSocket not open');
        }
    }
    onWsOpen() {
        console.error('WebSocket onWsOpen');
        this.sendHeartbeat();
        //@ts-ignore
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 55000);
        this.ws.onmessage = messageEvent => {
            const data = JSON.parse(messageEvent.data);
            if (data.clientId) {
                this.wsClientId = data.clientId;
                this.ws.onmessage = this.onMessage.bind(this);
                console.error(`WebSocket clientId: ${this.wsClientId}`);
            }
            else {
                console.error('Error: No clientId received from server!');
            }
        };
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('themeDarkMode')) {
        }
    }
    handleScroll() {
        if (this.programmaticScroll) {
            return; // Skip handling if the scroll was initiated programmatically
        }
        const currentScrollTop = this.chatMessagesElement.scrollTop;
        if (this.scrollStart === 0) {
            // Initial scroll
            this.scrollStart = currentScrollTop;
        }
        const threshold = 10;
        const atBottom = this.chatMessagesElement.scrollHeight -
            currentScrollTop -
            this.chatMessagesElement.clientHeight <=
            threshold;
        if (atBottom) {
            this.userScrolled = false;
            this.scrollStart = 0; // Reset scroll start
        }
        else if (Math.abs(this.scrollStart - currentScrollTop) > threshold) {
            this.userScrolled = true;
            // Optionally reset scrollStart here if you want to continuously check for threshold scroll
            // this.scrollStart = currentScrollTop;
        }
    }
    disconnectedCallback() {
        //    this.ws.close();
        super.disconnectedCallback();
        if (PROMPT_DEBUG) {
            document.removeEventListener('keydown', this.handleCtrlPKeyPress.bind(this));
        }
        if (this.chatMessagesElement) {
            this.chatMessagesElement.removeEventListener('scroll', this.handleScroll.bind(this));
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
    async onMessage(event) {
        const data = JSON.parse(event.data);
        //console.error(event.data);
        switch (data.sender) {
            case 'bot':
                this.addChatBotElement(data);
                break;
            case 'you':
                this.addChatUserElement(data);
                break;
        }
        if (this.chatLog.length > 1) {
            this.textInputLabel = this.t('Ask a follow-up question');
        }
        if (data.type !== 'stream_followup') {
            this.scrollDown();
        }
    }
    scrollDown() {
        if (!this.userScrolled) {
            this.programmaticScroll = true; // Set the flag before scrolling
            this.$$('#chat-messages').scrollTop =
                this.$$('#chat-messages').scrollHeight;
            setTimeout(() => {
                this.programmaticScroll = false; // Reset the flag after scrolling
            }, 100);
        }
    }
    addUserChatBotMessage(userMessage) {
        this.addChatBotElement({
            sender: 'you',
            type: 'start',
            message: userMessage,
        });
    }
    addThinkingChatBotMessage() {
        this.addChatBotElement({
            sender: 'bot',
            type: 'thinking',
            message: '',
        });
    }
    addToChatLogWithMessage(data, message = undefined, changeButtonDisabledState = undefined, changeButtonLabelTo = undefined, refinedCausesSuggestions = undefined, rawMessage = undefined) {
        this.infoMessage = message;
        data.refinedCausesSuggestions = refinedCausesSuggestions || [];
        data.rawMessage = data.rawMessage || rawMessage;
        this.chatLog = [...this.chatLog, data];
        this.requestUpdate();
        if (changeButtonDisabledState !== undefined) {
            this.sendButton.disabled = changeButtonDisabledState;
        }
        if (changeButtonLabelTo !== undefined) {
            //this.sendButton!.innerHTML = changeButtonLabelTo;
        }
    }
    get lastChatUiElement() {
        return this.chatElements[this.chatElements.length - 1];
    }
    async addChatBotElement(wsMessage) {
        switch (wsMessage.type) {
            case 'hello_message':
                this.addToChatLogWithMessage(wsMessage);
                break;
            case 'thinking':
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.spinnerActive = false;
                }
                this.addToChatLogWithMessage(wsMessage, this.t('Thinking...'));
                break;
            case 'noStreaming':
                this.addToChatLogWithMessage(wsMessage, wsMessage.message);
                await this.updateComplete;
                this.lastChatUiElement.spinnerActive = true;
                break;
            case 'agentStart':
                console.log('agentStart');
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.spinnerActive = false;
                }
                const startOptions = wsMessage.data;
                setTimeout(() => {
                    this.scrollDown();
                }, 50);
                if (startOptions.noStreaming) {
                    this.addChatBotElement({
                        sender: 'bot',
                        type: 'noStreaming',
                        message: startOptions.name,
                    });
                }
                else {
                    this.addToChatLogWithMessage(wsMessage, startOptions.name);
                    this.chatLog[this.chatLog.length - 1].message = `${startOptions.name}\n\n`;
                }
                this.requestUpdate();
                break;
            case 'liveLlmCosts':
                this.fire('llm-total-cost-update', wsMessage.data);
                break;
            case 'memoryIdCreated':
                this.serverMemoryId = wsMessage.data;
                this.fire('server-memory-id-created', wsMessage.data);
                break;
            case 'agentCompleted':
                console.log('agentCompleted...');
                const completedOptions = wsMessage.data;
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.spinnerActive = false;
                    this.lastChatUiElement.message = completedOptions.name;
                }
                else {
                    console.error('No last element on agentCompleted');
                }
                break;
            case 'agentUpdated':
                console.log('agentUpdated');
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.updateMessage = wsMessage.message;
                }
                else {
                    console.error('No last element on agentUpdated');
                }
                break;
            case 'start':
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.spinnerActive = false;
                }
                this.addToChatLogWithMessage(wsMessage, this.t('Thinking...'));
                if (!this.chatLog[this.chatLog.length - 1].message)
                    this.chatLog[this.chatLog.length - 1].message = '';
                break;
            case 'start_followup':
                this.lastChatUiElement.followUpQuestionsRaw = '';
                break;
            case 'stream_followup':
                this.lastChatUiElement.followUpQuestionsRaw += wsMessage.message;
                this.requestUpdate();
                break;
            case 'info':
                if (wsMessage.message) {
                    this.infoMessage = wsMessage.message;
                }
                else if (wsMessage.data) {
                    const data = wsMessage.data;
                    if (data.name === 'sourceDocuments') {
                        this.fire('source-documents', data.message);
                        this.addToChatLogWithMessage(wsMessage);
                    }
                    if (this.lastChatUiElement) {
                        this.lastChatUiElement.spinnerActive = false;
                    }
                }
                break;
            case 'moderation_error':
                wsMessage.message =
                    'OpenAI Moderation Flag Error. Please refine your question.';
                this.addToChatLogWithMessage(wsMessage, wsMessage.message, false, this.t('Send'));
                break;
            case 'error':
                this.addToChatLogWithMessage(wsMessage, wsMessage.message, false, this.t('Send'));
                break;
            case 'end':
                this.lastChatUiElement.stopJsonLoading();
                this.chatLog[this.chatLog.length - 1].debug = wsMessage.debug;
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = this.t('Send');
                this.infoMessage = this.defaultInfoMessage;
                break;
            case 'message':
                if (this.lastChatUiElement) {
                    this.lastChatUiElement.spinnerActive = false;
                }
                this.addToChatLogWithMessage(wsMessage, wsMessage.message, undefined, undefined, wsMessage.refinedCausesSuggestions);
                this.chatLog[this.chatLog.length - 1].refinedCausesSuggestions =
                    wsMessage.refinedCausesSuggestions;
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = this.t('Send');
                this.infoMessage = this.defaultInfoMessage;
                this.requestUpdate();
                break;
            case 'stream':
                if (wsMessage.message && wsMessage.message != 'undefined') {
                    //@ts-ignore
                    this.infoMessage = this.t('typing');
                    this.chatLog[this.chatLog.length - 1].message =
                        this.chatLog[this.chatLog.length - 1].message + wsMessage.message;
                    //console.error(this.chatLog[this.chatLog.length - 1].message)
                    this.requestUpdate();
                    break;
                }
        }
        this.scrollDown();
    }
    addChatUserElement(data) {
        this.chatLog = [...this.chatLog, data];
    }
    async sendChatMessage() {
        const message = this.chatInputField.value;
        if (message.length === 0)
            return;
        //this.ws.send(message);
        this.chatInputField.value = '';
        this.sendButton.disabled = false;
        //this.sendButton!.innerHTML = this.t('Thinking...');
        setTimeout(() => {
            this.chatInputField.blur();
        });
    }
    get simplifiedChatLog() {
        let chatLog = this.chatLog.filter(chatMessage => chatMessage.type != 'thinking' &&
            chatMessage.type != 'info' &&
            chatMessage.type != 'noStreaming' &&
            chatMessage.message);
        return chatLog.map(chatMessage => {
            return {
                sender: chatMessage.sender == 'bot' ? 'assistant' : 'user',
                message: chatMessage.rawMessage
                    ? chatMessage.rawMessage
                    : chatMessage.message,
            };
        });
    }
    static get styles() {
        return [
            super.styles,
            css `
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
          align-self: flex-start;
          max-width: 80%;
          justify-content: flex-start;
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
          padding: 8px;
        }

        @media (max-width: 600px) {
          .chat-window {
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

        .currentSourceTitle {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .currentSourceDescription {
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .sourceLinkButton {
          margin-top: 16px;
          margin-bottom: 320px;
        }

        .currentSourceUrl {
          max-width: 40ch;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 12px;
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

        .chatElement[thinking] {
          margin-top: 16px;
          margin-bottom: 8px;
        }

        @media (max-width: 960px) {
          .restartButton {
            margin-left: 8px;
            display: none;
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
    followUpQuestion(event) {
        this.chatInputField.value = event.detail;
        this.sendChatMessage();
    }
    reset() {
        this.chatLog = [];
        if (this.ws) {
            this.ws.close();
            this.initWebSockets();
        }
        this.serverMemoryId = undefined;
        this.requestUpdate();
    }
    toggleDarkMode() {
        this.themeDarkMode = !this.themeDarkMode;
        this.fire('theme-dark-mode', this.themeDarkMode);
        this.requestUpdate();
    }
    renderChatInput() {
        return html `
      ${this.showCleanupButtonAtBottom
            ? html `
        <md-outlined-icon-button
          class="restartButton"
          @click="${() => this.fire('reset-chat')}"
        ><md-icon>refresh</md-icon></md-icon></md-outlined-icon-button>
      `
            : nothing}
      ${this.onlyUseTextField || this.chatLog.length > 1
            ? html `
            <md-outlined-text-field
              class="textInput"
              type="text"
              hasTrailingIcon
              id="chatInput"
              rows="${this.chatLog.length > 1 ? '1' : '3'}"
              @focus="${() => (this.inputIsFocused = true)}"
              @blur="${() => (this.inputIsFocused = true)}"
              @keyup="${(e) => {
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
          `
            : html `<md-outlined-text-field
            class="textInput"
            type="textarea"
            hasTrailingIcon
            id="chatInput"
            rows="3"
            @focus="${() => (this.inputIsFocused = true)}"
            @blur="${() => (this.inputIsFocused = true)}"
            .label="${this.textInputLabel}"
          >
            <md-icon
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
    cancelSourceDialog() {
        this.currentDocumentSourceToDisplay = undefined;
        const dialog = this.$$('#sourceDialog');
        dialog.open = false;
    }
    openSourceDialog(event) {
        this.currentDocumentSourceToDisplay = event.detail;
        this.requestUpdate();
        const dialog = this.$$('#sourceDialog');
        dialog.open = true;
    }
    stripDomainForFacIcon(url) {
        let domain = url.split('/')[2];
        console.error(`Domain is ${domain}`);
        return domain;
    }
    renderSourceDialog() {
        return html `
      <md-dialog
        id="sourceDialog"
        @closed="${() => this.cancelSourceDialog()}"
        ?fullscreen="${!this.wide}"
        class="dialog"
        id="dialog"
      >
        ${this.currentDocumentSourceToDisplay
            ? html ` <div slot="headline">
                ${this.currentDocumentSourceToDisplay.title}
              </div>
              <div slot="content" id="content">
                <div class="layout vertical">
                  <div class="layout horizontal center-center">
                    <img
                      src="https://www.google.com/s2/favicons?domain=${this.stripDomainForFacIcon(this.currentDocumentSourceToDisplay.url)}&sz=24"
                      slot="icon"
                      width="24"
                      height="24"
                      class="sourceFavIcon"
                    />
                  </div>
                  <div class="currentSourceDescription">
                    ${this.currentDocumentSourceToDisplay
                .compressedFullDescriptionOfAllContents}
                  </div>
                  <div class="layout horizontal center-center sourceLinkButton">
                    ${this.currentDocumentSourceToDisplay.url
                .toLowerCase()
                .indexOf('.pdf') > -1
                ? html `
                          <a
                            href="${this.currentDocumentSourceToDisplay.url}"
                            target="_blank"
                            download
                          >
                            <md-filled-button>
                              ${this.t('Open PDF')}
                            </md-filled-button>
                          </a>
                        `
                : html `
                          <a
                            href="${this.currentDocumentSourceToDisplay.url}"
                            target="_blank"
                          >
                            <md-filled-button>
                              ${this.t('Visit Website')}
                            </md-filled-button>
                          </a>
                        `}
                  </div>
                </div>
              </div>`
            : nothing}
        <div slot="actions">
          <md-text-button @click="${() => this.cancelSourceDialog()}">
            ${this.t('cancel')}
          </md-text-button>
        </div>
      </md-dialog>
    `;
    }
    render() {
        return html `
      ${this.renderSourceDialog()}
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ps-ai-chat-element
            ?hidden="${!this.defaultInfoMessage}"
            class="chatElement bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="welcomeMessage"
            sender="bot"
          ></ps-ai-chat-element>
          ${this.chatLog
            .filter(chatElement => !chatElement.hidden)
            .map(chatElement => html `
                <ps-ai-chat-element
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
                ></ps-ai-chat-element>
              `)}
        </div>
        <div class="layout horizontal center-center chat-input">
          ${this.renderChatInput()}
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], PsChatAssistant.prototype, "chatLog", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "infoMessage", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "wsClientId", void 0);
__decorate([
    property({ type: Number })
], PsChatAssistant.prototype, "webSocketsErrorCount", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "defaultInfoMessage", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "wsEndpoint", void 0);
__decorate([
    property({ type: Object })
], PsChatAssistant.prototype, "ws", void 0);
__decorate([
    property({ type: Boolean })
], PsChatAssistant.prototype, "inputIsFocused", void 0);
__decorate([
    property({ type: Boolean })
], PsChatAssistant.prototype, "onlyUseTextField", void 0);
__decorate([
    property({ type: Object })
], PsChatAssistant.prototype, "currentDocumentSourceToDisplay", void 0);
__decorate([
    property({ type: Number })
], PsChatAssistant.prototype, "clusterId", void 0);
__decorate([
    property({ type: Boolean })
], PsChatAssistant.prototype, "userScrolled", void 0);
__decorate([
    property({ type: Number })
], PsChatAssistant.prototype, "communityId", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "textInputLabel", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "currentFollowUpQuestions", void 0);
__decorate([
    property({ type: Boolean })
], PsChatAssistant.prototype, "programmaticScroll", void 0);
__decorate([
    property({ type: Boolean })
], PsChatAssistant.prototype, "showCleanupButtonAtBottom", void 0);
__decorate([
    property({ type: Number })
], PsChatAssistant.prototype, "scrollStart", void 0);
__decorate([
    property({ type: String })
], PsChatAssistant.prototype, "serverMemoryId", void 0);
__decorate([
    property({ type: Number })
], PsChatAssistant.prototype, "defaultDevWsPort", void 0);
__decorate([
    query('#sendButton')
], PsChatAssistant.prototype, "sendButton", void 0);
__decorate([
    queryAll('ps-ai-chat-element')
], PsChatAssistant.prototype, "chatElements", void 0);
__decorate([
    query('#chatInput')
], PsChatAssistant.prototype, "chatInputField", void 0);
__decorate([
    query('#chat-window')
], PsChatAssistant.prototype, "chatWindow", void 0);
__decorate([
    query('#chat-messages')
], PsChatAssistant.prototype, "chatMessagesElement", void 0);
PsChatAssistant = __decorate([
    customElement('ps-chat-assistant')
], PsChatAssistant);
export { PsChatAssistant };
//# sourceMappingURL=ps-chat-assistant.js.map