import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("ps-input-text-area")
export class PsInputTextArea extends LitElement {
  @property({ type: Number }) rows = 4;
  @property({ type: String }) placeholder = "Hvernig get ég aðstoðað þig?";
  @property({ type: String }) value = "";

  @property({ type: String, attribute: "aria-label" }) ariaLabel = "";

  @property({ type: Boolean, reflect: true }) readonly = false;

  static styles = css`
    .textarea {
      background-color: #fff3f2;
      border: 0;
      color: #111;
      flex: 1;
      outline: none;
      resize: none;
      width: 600px;
      max-width: 600px;
      margin-top: 16px;
      margin-left: 32px;
      font-size: 15px;
      line-height: 1.25;
    }

    @media (max-width: 600px) {
      .textarea {
        max-width: 80vw;
        margin-left: 0;
      }
    }

    .textarea::placeholder {
      color: #111;
    }
  `;

  @query("#textarea")
  private _textarea?: HTMLTextAreaElement;

  focus() {
    this._textarea?.focus();
  }

  clear() {
    if (this._textarea) {
      this._textarea.value = "";
    }
    this.value = "";
  }

  private _forward(e: Event) {
    const ctor = e.constructor as { new (type: string, init: any): Event };
    const event = new ctor(e.type, e);
    if (e.type != "paste") {
      this.dispatchEvent(event);
    }
    e.preventDefault();
    e.stopPropagation();
  }

  private _onInput(e: InputEvent) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this._forward(e);
  }

  render() {
    const ariaLabel = this.ariaLabel || this.placeholder;
    return html`
      <textarea
        id="textarea"
        class="textarea"
        autocomplete="off"
        aria-label=${ariaLabel}
        ?readonly=${this.readonly}
        .value=${this.value}
        rows=${this.rows}
        spellcheck="false"
        placeholder=${this.placeholder}
        @keyup=${this._forward}
        @input=${this._onInput}
      ></textarea>
    `;
  }
}
