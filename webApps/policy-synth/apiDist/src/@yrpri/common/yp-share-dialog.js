import { __decorate, __metadata } from "tslib";
import { html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { YpBaseElement } from './yp-base-element.js';
import 'share-menu';
let YpShareDialog = class YpShareDialog extends YpBaseElement {
    render() {
        return html `
      <share-menu
        @share="${this.sharedContent}"
        class="shareIcon"
        id="shareButton"
        .title="${this.t('post.shareInfo')}"
        .url="${this.url || ''}"
      ></share-menu>
    `;
    }
    async open(url, label, sharedContent) {
        this.url = url;
        this.label = label;
        this.sharedContent = sharedContent;
        await this.requestUpdate();
        //TODO: fix this
        this.$$('#shareButton') /*ShareMenu*/.socials = [
            'clipboard',
            'facebook',
            'twitter',
            'whatsapp',
            'email',
            'linkedin',
        ];
        this.$$('#shareButton').share();
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Function)
], YpShareDialog.prototype, "sharedContent", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], YpShareDialog.prototype, "url", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], YpShareDialog.prototype, "label", void 0);
YpShareDialog = __decorate([
    customElement('yp-share-dialog')
], YpShareDialog);
export { YpShareDialog };
//# sourceMappingURL=yp-share-dialog.js.map