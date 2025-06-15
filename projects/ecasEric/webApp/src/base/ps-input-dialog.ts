import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element";
import { customElement, property, query } from "lit/decorators.js";
import { html, nothing, css } from "lit";
import { repeat } from "lit/directives/repeat.js";

import "@material/web/icon/icon.js";
import "@material/web/chips/chip-set.js";
import "@material/web/chips/input-chip.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/iconbutton/filled-icon-button.js";
import "@material/web/button/filled-button.js";
import "@material/web/iconbutton/outlined-icon-button.js";

import "./ps-input-textarea.js";
import { PsInputTextArea } from "./ps-input-textarea.js";

@customElement("ps-input-dialog")
export class PsInputDialog extends YpBaseElement {
  @property({ type: Boolean })
  private _isSendButtonDisabled = true;

  @property({ type: Boolean })
  private isDisabled = false;

  @property({ type: Number })
  private conversationGroupId = 0;

  @property({ type: String, reflect: true })
  value = "";

  @query("ps-input-text-area")
  private _chatTextarea?: PsInputTextArea;

  renderAnimatedLogo() {
    if (this._isSendButtonDisabled) {
      return html`
        <img
          class="animatedLogo"
          src="https://yp-eu-assets.citizens.is/ecas/2_loading.gif"
        />
      `;
    } else {
      return html`
        <img
          class="animatedLogo"
          src="https://s3.eu-west-1.amazonaws.com/yp-eu-assets.citizens.is/ecas/logoMark+1.svg"
        />
      `;
    }
  }

  async focus() {
    this._chatTextarea?.focus();
  }

  render() {
    return html`
      <div
        class="chatInput layout horizontal ${this.isDisabled
          ? "is-disabled"
          : ""}"
      >
        ${this.renderAnimatedLogo()}
        <ps-input-text-area
          @keydown=${this.handleKeyDown}
          @input=${this._handleInput}
          ?readonly=${this.isDisabled}
          placeholder=${this.isDisabled
            ? "Vinn að svari"
            : "Ask me anything, I'm here to help"}
        ></ps-input-text-area>
        <div class="actions">
          ${false && this.isDisabled
            ? html``
            : html`
                <div
                  class="iconButton"
                  label="Send"
                  role="button"
                  ?disabled=${this._isSendButtonDisabled || this.isDisabled}
                  @click=${this._onSend}
                >
                  <img
                    style="margin-top: 4px"
                    width="28"
                    height="28"
                    src="https://yp-eu-assets.citizens.is/ecas/send.svg"
                  />
                </div>
              `}
        </div>
      </div>
    `;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this._onSend();
    }
  }

  setInputFocus() {
    this._chatTextarea?.focus();
  }

  truncateText(text: string, maxLength: number = 10): string {
    if (this.wide) {
      maxLength = 20;
    }
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  countWordsWithFormattedNumber(text: string): string {
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const formattedWordCount = wordCount.toLocaleString();
    return `${formattedWordCount} orð`;
  }

  private _handleInput() {
    this._isSendButtonDisabled = !this._sendButtonEnabled();
  }

  private _sendButtonEnabled() {
    const messageText = this._chatTextarea?.value.trim() || "";
    return messageText.length > 1;
  }

  private _onSend() {
    const messageText = this._chatTextarea?.value.trim() || "";

    this.value = messageText;

    this.fire("chat-message", messageText);

    this._chatTextarea?.clear();
  }

  private _onStopWorkflow() {
    this.fire("stop-workflow");
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .animatedLogo {
          width: 32px;
          height: 32px;
          margin-top: 12px;
          margin-left: 8px;
        }

        :host {
          margin-bottom: 16px;
        }

        :host * {
          box-sizing: inherit;
        }

        .chatInput {
          position: relative;
          width: 770px;
          background-color: #fff3f2;
          border-radius: 0;
          overflow: hidden;
          padding: 14px 12px 40px;
          min-height: 128px;
          display: flex;
          flex-direction: column;
          row-gap: 8px;
          transition: opacity 0.3s;
        }

        .chatInput.is-disabled {
          opacity: 0.8;
        }

        .textarea {
          background-color: transparent;
          border: 0;
          color: #111;
          flex: 1;
          outline: none;
          resize: none;
          width: 100%;
          font-size: 15px;
          font-family: inherit;
        }

        .textarea::placeholder {
          color: #111;
        }

        .actions {
          position: absolute;
          right: 8px;
          bottom: 8px;
        }

        .iconButton {
          background-color: #50c5b7;
          border-radius: 50%;
          padding: 4px;
          margin-bottom: 12px;
          margin-right: 12px;
        }
      `,
    ];
  }
}
