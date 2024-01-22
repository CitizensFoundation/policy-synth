import { __decorate, __metadata } from "tslib";
import { html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { YpBaseElement } from './yp-base-element.js';
//import insertTextAtCursor from 'insert-text-at-cursor';
import '@material/web/iconbutton/outlined-icon-button.js';
//TODO: Load this one later emoji-button is 256KB!
let YpEmojiSelector = class YpEmojiSelector extends YpBaseElement {
    render() {
        return html `
      <md-outlined-icon-button
        .label="${this.t('addEmoji')}"
        id="trigger"
        icon="sentiment_satisfied_alt"
        @click="${this.togglePicker}"></md-outlined-icon-button>
    `;
    }
    togglePicker() {
        window.appDialogs.getDialogAsync("emojiDialog", (dialog) => {
            dialog.open(this.$$("#trigger"), this.inputTarget);
        });
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", HTMLInputElement)
], YpEmojiSelector.prototype, "inputTarget", void 0);
YpEmojiSelector = __decorate([
    customElement('yp-emoji-selector')
], YpEmojiSelector);
export { YpEmojiSelector };
//# sourceMappingURL=yp-emoji-selector.js.map