import { PropertyValueMap, css, html, nothing } from "lit";
import { property, customElement, query, queryAll } from "lit/decorators.js";

import "@material/web/fab/fab.js";
import "@material/web/radio/radio.js";
import "@material/web/button/elevated-button.js";
import "@material/web/button/text-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/filled-button.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/icon/icon.js";

import { MdDialog } from "@material/web/dialog/dialog.js";
import "@material/web/iconbutton/outlined-icon-button.js";

import "@yrpri/webapp/common/yp-image.js";
import { PsAiChatElement } from "./ps-ai-chat-element.js";
import { MdFilledTonalButton } from "@material/web/button/filled-tonal-button.js";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";

import { BaseChatBotServerApi } from "./BaseChatBotApi.js";
import "./ps-ai-chat-element.js";
import { PsStreamingLlmBase } from "./ps-streaming-llm-base.js";
import "./ps-input-dialog.js";
import { PsInputDialog } from "./ps-input-dialog.js";

const PROMPT_DEBUG = true;

@customElement("ps-chat-assistant")
export class PsChatAssistant extends PsStreamingLlmBase {
  @property({ type: Array })
  chatLog: PsAiChatWsMessage[] = [];

  @property({ type: String })
  infoMessage!: string;

  @property({ type: String })
  defaultInfoMessage: string = "I'm your friendly chat assistant";

  @property({ type: Boolean })
  inputIsFocused = false;

  @property({ type: Boolean })
  onlyUseTextField = false;

  @property({ type: Boolean })
  userScrolled = false;

  @property({ type: Number })
  clusterId!: number;

  @property({ type: Number })
  communityId!: number;

  @property({ type: String })
  textInputLabel!: string;

  @property({ type: Boolean })
  showCleanupButtonAtBottom = false;

  // Override the default port from the base class if you want 8000:
  @property({ type: Number })
  defaultDevWsPort = 8000;

  @query("#sendButton")
  sendButton?: MdFilledTonalButton;

  @queryAll("ai-chat-element")
  chatElements?: PsAiChatElement[];

  @query("#chatInput")
  chatInputField?: PsInputDialog;

  @query("#chat-window")
  chatWindow?: HTMLElement;

  @query("#chat-messages")
  chatMessagesElement?: HTMLElement;

  api: BaseChatBotServerApi;
  // no longer need heartbeatInterval because the base class does ping/pong

  constructor() {
    super();
    this.api = new BaseChatBotServerApi();
  }

  override connectedCallback() {
    super.connectedCallback();

    if (PROMPT_DEBUG) {
      document.addEventListener("keydown", this.handleCtrlPKeyPress.bind(this));
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (PROMPT_DEBUG) {
      document.removeEventListener(
        "keydown",
        this.handleCtrlPKeyPress.bind(this)
      );
    }

    if (this.chatMessagesElement) {
      this.chatMessagesElement.removeEventListener(
        "scroll",
        this.handleScroll.bind(this)
      );
    }
  }

  handleCtrlPKeyPress(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === "c") {
      this.copyLatestDebugInfoToClipboard();
      event.preventDefault();
    }
  }

  copyLatestDebugInfoToClipboard() {
    const latestChatMessage = this.chatLog[this.chatLog.length - 1];
    if (latestChatMessage && latestChatMessage.debug) {
      const systemPrompt =
        latestChatMessage.debug.systemPromptUsedForGeneration || "";
      const firstUserPrompt =
        latestChatMessage.debug.firstUserMessageUserForGeneration || "";
      const debugInfo = `${systemPrompt}\n\n-------------------------\n\n${firstUserPrompt}`;

      navigator.clipboard
        .writeText(debugInfo)
        .then(() => console.log("Debug info copied to clipboard!"))
        .catch((err) => console.error("Failed to copy debug info:", err));
    }
  }

  protected override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    // focus the text input
    setTimeout(() => {
      this.chatInputField?.focus();
    }, 420);

    setTimeout(() => {
      this.chatMessagesElement?.addEventListener(
        "scroll",
        this.handleScroll.bind(this)
      );
    }, 500);
  }

  handleScroll() {
    if (this.programmaticScroll) {
      return; // Skip handling if the scroll was initiated programmatically
    }

    const currentScrollTop = this.chatMessagesElement?.scrollTop || 0;
    if (this.scrollStart === 0) {
      // Initial scroll
      this.scrollStart = currentScrollTop;
    }

    const threshold = 10;
    const atBottom =
      (this.chatMessagesElement?.scrollHeight || 0) -
        currentScrollTop -
        (this.chatMessagesElement?.clientHeight || 0) <=
      threshold;

    if (atBottom) {
      this.userScrolled = false;
      this.scrollStart = 0; // Reset scroll start
    } else if (Math.abs(this.scrollStart - currentScrollTop) > threshold) {
      this.userScrolled = true;
    }
  }

  /**
   * The base class calls `onMessage(event)` for each incoming WebSocket message.
   */
  override async onMessage(event: MessageEvent) {
    const data: PsAiChatWsMessage = JSON.parse(event.data);

    switch (data.sender) {
      case "bot":
        this.addChatBotElement(data);
        break;
      case "you":
        this.addChatUserElement(data);
        break;
    }

    if (this.chatLog.length > 1) {
      this.textInputLabel = this.t("Ask a follow-up question");
    }

    if (data.type !== "stream_followup") {
      this.scrollDown();
    }
  }

  /**
   * Your base class calls this when it's time to autoscroll.
   */
  override scrollDown(): void {
    if (!this.userScrolled) {
      this.programmaticScroll = true; // Set the flag before scrolling
      const msgElem = this.chatMessagesElement;
      if (msgElem) {
        msgElem.scrollTop = msgElem.scrollHeight;
      }
      setTimeout(() => {
        this.programmaticScroll = false; // Reset the flag after scrolling
      }, 100);
    }
  }

  /**
   * Send chat message to the server.
   * Instead of using this.ws.send(...), we use this.sendClientMessage(...)
   * from PsStreamingLlmBase to ensure consistent handling & reconnection.
   */
  async sendChatMessage() {
    debugger;
    const message = this.chatInputField?.value?.trim() || "";
    if (!message) return;

    // Reset the text field
    this.chatInputField!.value = "";
    this.chatInputField!.isDisabled = true;

    // Use the raw string approach for the server protocol:
    // e.g., {sender: 'you', type: 'start', message: '...'}
    this.sendClientMessage(
      JSON.stringify({
        sender: "you",
        type: "start",
        message,
      })
    );

    setTimeout(() => {
      this.chatInputField?.blur();
    }, 0);
  }

  addUserChatBotMessage(userMessage: string) {
    this.addChatBotElement({
      sender: "you",
      type: "start",
      message: userMessage,
    });
  }

  addThinkingChatBotMessage() {
    this.addChatBotElement({
      sender: "bot",
      type: "thinking",
      message: "",
    });
  }

  async addChatBotElement(wsMessage: PsAiChatWsMessage) {
    switch (wsMessage.type) {
      case "hello_message":
        this.addToChatLogWithMessage(wsMessage);
        break;
      case "thinking":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(wsMessage, this.t("Thinking..."));
        break;
      case "noStreaming":
        this.addToChatLogWithMessage(wsMessage, wsMessage.message);
        await this.updateComplete;
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = true;
        }
        break;
      case "agentStart":
        console.log("agentStart");
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = false;
        }
        const startOptions = wsMessage.data as PsAgentStartWsOptions;
        setTimeout(() => this.scrollDown(), 50);

        if (startOptions?.noStreaming) {
          this.addChatBotElement({
            sender: "bot",
            type: "noStreaming",
            message: startOptions.name,
          } as PsAiChatWsMessage);
        } else {
          this.addToChatLogWithMessage(wsMessage, startOptions?.name || "");
          const lastMsg = this.chatLog[this.chatLog.length - 1];
          lastMsg.message = `${startOptions?.name}\n\n`;
        }
        this.requestUpdate();
        break;
      case "liveLlmCosts":
        this.fire("llm-total-cost-update", wsMessage.data as number);
        break;
      case "memoryIdCreated":
        this.serverMemoryId = wsMessage.data as string;
        this.fire("server-memory-id-created", wsMessage.data as string);
        break;
      case "agentCompleted":
        console.log("agentCompleted...");
        const completedOptions = wsMessage.data as PsAgentCompletedWsOptions;
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = false;
          this.lastChatUiElement.message = completedOptions?.name;
        }
        break;
      case "agentUpdated":
        console.log("agentUpdated");
        if (this.lastChatUiElement) {
          this.lastChatUiElement.updateMessage = wsMessage.message;
        }
        break;
      case "start":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(wsMessage, this.t("Thinking..."));
        if (!this.chatLog[this.chatLog.length - 1].message) {
          this.chatLog[this.chatLog.length - 1].message = "";
        }
        break;
      case "start_followup":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.followUpQuestionsRaw = "";
        }
        break;
      case "stream_followup":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.followUpQuestionsRaw += wsMessage.message;
        }
        this.requestUpdate();
        break;
      case "info":
        if (wsMessage.message) {
          this.infoMessage = wsMessage.message;
        } else if (wsMessage.data) {
          const data = wsMessage.data as any;
          if (data.name === "sourceDocuments") {
            this.fire("source-documents", data.message);
            this.addToChatLogWithMessage(wsMessage);
          }
          if (this.lastChatUiElement) {
            this.lastChatUiElement.spinnerActive = false;
          }
        }
        break;
      case "moderation_error":
        wsMessage.message =
          "OpenAI Moderation Flag Error. Please refine your question.";
        this.addToChatLogWithMessage(
          wsMessage,
          wsMessage.message,
          false,
          this.t("Send")
        );
        break;
      case "error":
        this.addToChatLogWithMessage(
          wsMessage,
          wsMessage.message,
          false,
          this.t("Send")
        );
        break;
      case "end":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.stopJsonLoading();
        }
        this.chatLog[this.chatLog.length - 1].debug = wsMessage.debug;
        this.streamingEnded();

        this.infoMessage = this.defaultInfoMessage;
        break;
      case "message":
        if (this.lastChatUiElement) {
          this.lastChatUiElement.spinnerActive = false;
        }
        this.addToChatLogWithMessage(
          wsMessage,
          wsMessage.message,
          undefined,
          undefined,
          wsMessage.refinedCausesSuggestions
        );
        this.chatLog[this.chatLog.length - 1].refinedCausesSuggestions =
          wsMessage.refinedCausesSuggestions;
        this.sendButton!.disabled = false;
        this.sendButton!.innerHTML = this.t("Send");
        this.infoMessage = this.defaultInfoMessage;
        this.requestUpdate();
        break;
      case "stream":
        if (wsMessage.message && wsMessage.message !== "undefined") {
          this.infoMessage = this.t("typing");
          this.chatLog[this.chatLog.length - 1].message += wsMessage.message;
          this.requestUpdate();
        }
        break;
    }

    this.scrollDown();
  }

  addToChatLogWithMessage(
    data: PsAiChatWsMessage,
    message?: string,
    changeButtonDisabledState?: boolean,
    changeButtonLabelTo?: string,
    refinedCausesSuggestions?: string[],
    rawMessage?: string
  ) {
    this.infoMessage = message || "";
    data.refinedCausesSuggestions = refinedCausesSuggestions || [];
    data.rawMessage = data.rawMessage || rawMessage;

    this.chatLog = [...this.chatLog, data];
    this.requestUpdate();

    if (changeButtonDisabledState !== undefined) {
      this.sendButton!.disabled = changeButtonDisabledState;
    }
    if (changeButtonLabelTo !== undefined) {
      // e.g. this.sendButton!.innerHTML = changeButtonLabelTo;
    }
  }

  get lastChatUiElement() {
    return this.chatElements?.[this.chatElements.length - 1];
  }

  addChatUserElement(data: PsAiChatWsMessage) {
    this.chatLog = [...this.chatLog, data];
  }

  followUpQuestion(event: CustomEvent) {
    this.chatInputField!.value = event.detail;
    this.sendChatMessage();
  }

  reset() {
    this.chatLog = [];
    // Let the base class handle closing & resetting
    super.reset();
    this.serverMemoryId = undefined;
    this.requestUpdate();
  }

  toggleDarkMode() {
    this.themeDarkMode = !this.themeDarkMode;
    this.fire("theme-dark-mode", this.themeDarkMode);
    this.requestUpdate();
  }

  openSourceDialog(event: CustomEvent) {
    this.requestUpdate();
    const dialog = this.$$("#sourceDialog") as MdDialog;
    dialog.open = true;
  }

  cancelSourceDialog() {
    const dialog = this.$$("#sourceDialog") as MdDialog;
    dialog.open = false;
  }

  stripDomainForFacIcon(url: string) {
    const domain = url.split("/")[2] || "";
    return domain;
  }

  streamingEnded() {
    this.chatInputField!.isDisabled = false;
  }

  renderChatInput() {
    return html`
      <div class="layout vertical chatInputContainer">
        <div class="layout horizontal tagLine" ?hidden="${this.chatLog.length > 0}">
          Let me help you navigate EU telework laws.
        </div>
        <ps-input-dialog
          class="textInput"
          type="textarea"
          hasTrailingIcon
          id="chatInput"
          rows="5"
          @keyup="${(e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              this.sendChatMessage();
            }
          }}"
          @focus="${() => (this.inputIsFocused = true)}"
          @blur="${() => (this.inputIsFocused = true)}"
          .label="${this.textInputLabel}"
        ></ps-input-dialog>
      </div>
    `;
  }

  renderWelcome() {
    return html`
      <div class="layout vertical center-center">
        <div class="layout horizontal welcomeInfo">
          <div class="bigEricWelcome">Hello I’m Eric, your assistant.</div>
          <div class="flex"></div>
          <div class="bottomRightInfo">
            Supporting fair & informed telework across the EU
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
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
            .filter((chatElement) => !chatElement.hidden)
            .map(
              (chatElement) => html`
                <ps-ai-chat-element
                  ?thinking="${chatElement.type === "thinking" ||
                  chatElement.type === "noStreaming"}"
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
              `
            )}
          ${this.chatLog.length == 0 ? this.renderWelcome() : nothing}
        </div>
        <div class="layout horizontal center-center chat-input">
          ${this.renderChatInput()}
        </div>
      </div>
    `;
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .welcomeInfo {
          max-width: 790px;
        }

        .tagLine {
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 24px;
        }

        .bigEricWelcome {
          font-size: 72px;
          font-weight: bold;
          color: #50c5b7;
          width: 345px;
          margin-right: 130px;
        }

        @media (max-width: 600px) {
          .bigEricWelcome {
            font-size: 32px;
            width: 300px;
            margin-right: 0;
          }

          .chatInputContainer {
            width: 100%;
            align-self: center;
            margin-right: 32px;
            margin-left: 8px;
          }

          .welcomeInfo {
            flex-wrap: wrap;
          }
        }

        .bottomRightInfo {
          color: #1d42d9;
          font-size: 24px;
          width: 223px;
          text-align: right;
          align-self: flex-end;
          font-weight: 500;
          margin-left: 130px;
          margin-bottom: 16px;
        }

        @media (max-width: 600px) {
          .bottomRightInfo {
            font-size: 24px;
            margin: 16px;
            margin-left: 0;
          }
        }

        .infoMessage {
          margin-top: 8px;
        }

        .chat-window {
          display: flex;
          flex-direction: column;
          height: 75vh;
          width: 100%;
          max-width: 1000px;
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
          scrollbar-color: #fff3f2 #fbe4dc;
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
          padding: 8px;
        }

        @media (max-width: 600px) {
          .you-chat-element {
            margin-right: 0;
          }

          .chat-input {
            padding: 0;
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
          padding: 32px;
          margin: 16px;
          margin-bottom: 16px;
          margin-left: 8px;
          margin-right: 8px;
          width: 770px;
          background-color: #fff3f2;
        }

        @media (max-width: 600px) {
          md-outlined-text-field {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }
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
}
