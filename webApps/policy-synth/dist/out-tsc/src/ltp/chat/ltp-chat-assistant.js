import { __decorate, __metadata } from "tslib";
import { css, html } from 'lit';
import { property, customElement, query, queryAll } from 'lit/decorators.js';
import { YpBaseElement } from '../../@yrpri/common/yp-base-element';
import '@material/web/fab/fab.js';
import '@material/web/radio/radio.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '../../@yrpri/common/yp-image.js';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import './ltp-ai-chat-element.js';
import { LtpServerApi } from '../LtpServerApi';
const PROMPT_DEBUG = true;
let LtpChatAssistant = class LtpChatAssistant extends YpBaseElement {
    constructor() {
        super();
        this.chatLog = [];
        this.defaultInfoMessage = "I'm your Current Reality Tree assistant. I'm here to help to identify direct causes of: ";
        this.inputIsFocused = false;
        this.userScrolled = false;
        this.lastChainCompletedAsValid = false;
        this.currentFollowUpQuestions = '';
        this.programmaticScroll = false;
        this.scrollStart = 0;
        this.api = new LtpServerApi();
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
        this.defaultInfoMessage += `**${this.nodeToAddCauseTo.description}**`;
        console.error(this.defaultInfoMessage);
        if (PROMPT_DEBUG) {
            document.addEventListener('keydown', this.handleCtrlPKeyPress.bind(this));
        }
        this.initWebSockets();
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onopen = this.onWsOpen.bind(this);
        this.ws.onerror = error => {
            //TODO: Try to resend the last message
            console.error('WebSocket Error ' + error);
            setTimeout(() => this.initWebSockets(), 500);
        };
        this.ws.onclose = error => {
            console.error('WebSocket Close ' + error);
            setTimeout(() => this.initWebSockets(), 500);
        };
    }
    initWebSockets() {
        let wsEndpoint;
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '192.1.168') {
            wsEndpoint = `ws://${window.location.hostname}:9292`;
        }
        else {
            wsEndpoint = `wss://${window.location.hostname}:443`;
        }
        try {
            this.ws = new WebSocket(wsEndpoint);
        }
        catch (error) {
            console.error('WebSocket Error ' + error);
            setTimeout(() => this.initWebSockets(), 2500);
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
    }
    onWsOpen() {
        console.error('WebSocket Open');
        this.sendHeartbeat();
        //@ts-ignore
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 55000);
        this.ws.onmessage = messageEvent => {
            const data = JSON.parse(messageEvent.data);
            if (data.clientId) {
                this.wsClientId = data.clientId;
                this.ws.onmessage = this.onMessage.bind(this);
            }
            else {
                console.error('Error: No clientId received from server!');
            }
        };
        this.reset();
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
        if (this.scrollStart === 0) { // Initial scroll
            this.scrollStart = currentScrollTop;
        }
        const threshold = 10;
        const atBottom = this.chatMessagesElement.scrollHeight - currentScrollTop - this.chatMessagesElement.clientHeight <= threshold;
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
            this.$$('#chat-messages').scrollTop = this.$$('#chat-messages').scrollHeight;
            setTimeout(() => {
                this.programmaticScroll = false; // Reset the flag after scrolling
            }, 100);
        }
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
    addChatBotElement(data) {
        const lastElement = this.chatElements[this.chatElements.length - 1];
        switch (data.type) {
            case 'hello_message':
                this.addToChatLogWithMessage(data);
                break;
            case 'thinking':
                if (lastElement) {
                    lastElement.active = false;
                }
                this.addToChatLogWithMessage(data, this.t('Thinking...'));
                break;
            case 'noStreaming':
                if (lastElement) {
                    lastElement.active = true;
                }
                this.addToChatLogWithMessage(data, data.message);
                break;
            case 'validationAgentStart':
                if (lastElement) {
                    lastElement.active = false;
                }
                const startOptions = data.message;
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
                    this.addToChatLogWithMessage(data, startOptions.name);
                    this.chatLog[this.chatLog.length - 1].message = `${startOptions.name}\n\n`;
                }
                this.requestUpdate();
                break;
            case 'validationAgentCompleted':
                if (lastElement) {
                    lastElement.active = false;
                }
                this.lastChainCompletedAsValid = false;
                this.lastValidatedCauses = undefined;
                const completedOptions = data.message;
                if (completedOptions.results.lastAgent ||
                    (completedOptions.results.validationErrors &&
                        completedOptions.results.validationErrors.length > 0)) {
                    this.getSuggestionsFromValidation(completedOptions.name, completedOptions.results);
                }
                if (completedOptions.results.isValid &&
                    completedOptions.results.lastAgent) {
                    this.lastChainCompletedAsValid = true;
                    this.lastValidatedCauses = this.lastCausesToValidate;
                }
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
                break;
            case 'message':
                if (lastElement) {
                    lastElement.active = false;
                }
                this.addToChatLogWithMessage(data, data.message, undefined, undefined, data.refinedCausesSuggestions);
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
            await this.api.runValidationChain(this.crtData.id, this.nodeToAddCauseTo.id, this.chatLog, this.wsClientId, effect, causes);
        }
        else {
            this.addChatBotElement({
                sender: 'bot',
                type: 'thinking',
                message: '',
            });
            this.lastChainCompletedAsValid = false;
            await this.api.sendGetRefinedCauseQuery(this.crtData.id, this.nodeToAddCauseTo.id, this.chatLog, this.wsClientId);
        }
    }
    async validateSelectedChoices(event) {
        const causes = event.detail;
        this.lastCausesToValidate = causes;
        await this.api.runValidationChain(this.crtData.id, this.nodeToAddCauseTo.id, this.chatLog, this.wsClientId, this.nodeToAddCauseTo.description, causes);
    }
    async getSuggestionsFromValidation(agentName, validationResults) {
        let effect;
        effect = this.nodeToAddCauseTo.description;
        let userMessage = `Expert: ${agentName}

Effect: ${this.nodeToAddCauseTo?.description}\n`;
        this.lastCausesToValidate.forEach((cause, index) => {
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
        await this.api.sendGetRefinedCauseQuery(this.crtData.id, this.nodeToAddCauseTo.id, this.chatLog, this.wsClientId);
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

        ltp-ai-chat-element[thinking] {
          margin-top: 8px;
          margin-bottom: 0px;
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
        this.ws.send('<|--reset-chat--|>');
    }
    toggleDarkMode() {
        this.themeDarkMode = !this.themeDarkMode;
        this.fire('theme-dark-mode', this.themeDarkMode);
        this.requestUpdate();
    }
    renderChatInput() {
        return html `
      <md-outlined-text-field
        class="textInput"
        .type="${this.chatLog.length > 1 ? 'text' : 'textarea'}"
        hasTrailingIcon
        id="chatInput"
        rows="${this.chatLog.length > 1 ? '1' : '3'}"
        @focus="${() => (this.inputIsFocused = true)}"
        @blur="${() => (this.inputIsFocused = true)}"
        @keyup="${(e) => {
            if (e.key === 'Enter' && this.chatLog.length > 1) {
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
        return html `
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ltp-ai-chat-element
            class="bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="info"
            sender="bot"
          ></ltp-ai-chat-element>
          ${this.chatLog
            .filter(chatElement => !chatElement.hidden)
            .map(chatElement => html `
                <ltp-ai-chat-element
                  ?thinking="${chatElement.type === 'thinking' ||
            chatElement.type === 'noStreaming'}"
                  @followup-question="${this.followUpQuestion}"
                  @validate-selected-causes="${this.validateSelectedChoices}"
                  .clusterId="${this.clusterId}"
                  class="${chatElement.sender}-chat-element"
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
    property({ type: Array }),
    __metadata("design:type", Array)
], LtpChatAssistant.prototype, "chatLog", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "infoMessage", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "wsClientId", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "crtData", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "nodeToAddCauseTo", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "defaultInfoMessage", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "wsEndpoint", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", WebSocket)
], LtpChatAssistant.prototype, "ws", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "inputIsFocused", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], LtpChatAssistant.prototype, "clusterId", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "userScrolled", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], LtpChatAssistant.prototype, "communityId", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "textInputLabel", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "lastChainCompletedAsValid", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], LtpChatAssistant.prototype, "currentFollowUpQuestions", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], LtpChatAssistant.prototype, "programmaticScroll", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], LtpChatAssistant.prototype, "scrollStart", void 0);
__decorate([
    query('#sendButton'),
    __metadata("design:type", MdFilledTonalButton)
], LtpChatAssistant.prototype, "sendButton", void 0);
__decorate([
    queryAll('ltp-ai-chat-element'),
    __metadata("design:type", Array)
], LtpChatAssistant.prototype, "chatElements", void 0);
__decorate([
    query('#chatInput'),
    __metadata("design:type", MdOutlinedTextField)
], LtpChatAssistant.prototype, "chatInputField", void 0);
__decorate([
    query('#chat-window'),
    __metadata("design:type", HTMLElement)
], LtpChatAssistant.prototype, "chatWindow", void 0);
__decorate([
    query('#chat-messages'),
    __metadata("design:type", HTMLElement)
], LtpChatAssistant.prototype, "chatMessagesElement", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], LtpChatAssistant.prototype, "lastCausesToValidate", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], LtpChatAssistant.prototype, "lastValidatedCauses", void 0);
LtpChatAssistant = __decorate([
    customElement('ltp-chat-assistant'),
    __metadata("design:paramtypes", [])
], LtpChatAssistant);
export { LtpChatAssistant };
//# sourceMappingURL=ltp-chat-assistant.js.map