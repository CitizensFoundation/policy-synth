import { __decorate } from "tslib";
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { YpMagicText } from './yp-magic-text.js';
let YpMagicTextDialog = class YpMagicTextDialog extends YpMagicText {
    static get styles() {
        return [
            super.styles,
            css `
        :host {
          display: block;
        }

        #dialog {
          background-color: #fff;
          max-width: 50%;
        }

        @media (max-width: 1100px) {
          #dialog {
            max-width: 80%;
          }
        }

        @media (max-width: 600px) {
          #dialog {
            max-width: 100%;
          }

          mwc-dialog {
            padding: 0;
            margin: 0;
          }
        }

        .buttons {
          color: var(--accent-color);
        }
      `,
        ];
    }
    render() {
        return html `
      <mwc-dialog id="dialog" aria-label="${this.t('textDialog')}">
        <div>
          ${this.finalContent
            ? html ` <div>${unsafeHTML(this.finalContent)}</div> `
            : html ` <div>${this.content}</div> `}
        </div>
        <md-outlined-button slot="primaryAction" dialogAction="close">
          ${this.closeDialogText}
        </md-outlined-button>
      </mwc-dialog>
    `;
    }
    subClassProcessing() {
        this.processedContent = this.processedContent?.replace(/\n/g, '<br />');
    }
    open(content, contentId, extraId, textType, contentLanguage, closeDialogText, structuredQuestionsConfig, skipSanitize = false, disableTranslation = false) {
        this.skipSanitize = skipSanitize;
        this.isDialog = true;
        this.content = content;
        this.contentId = contentId;
        this.extraId = extraId;
        this.textType = textType;
        this.contentLanguage = contentLanguage;
        this.structuredQuestionsConfig = structuredQuestionsConfig;
        this.closeDialogText = closeDialogText;
        this.disableTranslation = disableTranslation;
        this.$$('#dialog').open = true;
        setTimeout(() => {
            //TODO: What to fire here?
            this.fire('iron-resize');
        }, 50);
    }
};
YpMagicTextDialog = __decorate([
    customElement('yp-magic-text-dialog')
], YpMagicTextDialog);
export { YpMagicTextDialog };
//# sourceMappingURL=yp-magic-text-dialog.js.map