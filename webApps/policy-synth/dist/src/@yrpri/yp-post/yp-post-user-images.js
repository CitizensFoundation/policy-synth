import { __decorate, __metadata } from "tslib";
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { YpBaseElement } from '../common/yp-base-element.js';
import '@material/web/button/outlined-button.js';
import './yp-post-user-image-card.js';
//import { YpPostUserImageEdit } from './yp-post-user-image-edit.js';
let YpPostUserImages = class YpPostUserImages extends YpBaseElement {
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('post')) {
            this._postChanged();
        }
    }
    static get styles() {
        return [
            super.styles,
            css `
        md-outlined-button {
          margin-top: 32px;
          margin-bottom: 8px;
          background-color: var(--accent-color);
          color: #fff;
          width: 242px;
        }

        yp-post-user-image-card {
          margin-top: 32px;
          margin-bottom: 32px;
        }
      `,
        ];
    }
    render() {
        return html `
      <div class="layout vertical center-center">
        ${this.post
            ? html `
              <md-outlined-button
                raised
                @click="${this._newImage}"
                .label="${this.t('posts.newUserImage')}"></md-outlined-button>

              ${this.images
                ? html `
                    ${this.images.map(image => html `
                        <yp-post-user-image-card
                          .post="${this.post}"
                          .image="${image}"
                          @refresh="${this._refresh}"></yp-post-user-image-card>
                      `)}
                  `
                : nothing}
            `
            : nothing}
      </div>
    `;
    }
    async _refresh() {
        if (this.post) {
            this.images = await window.serverApi.getImages(this.post.id);
            if (this.images && this.images.length > 0) {
                this.fire('yp-post-image-count', this.images.length);
            }
            else {
                this.fire('yp-post-image-count', 0);
            }
        }
    }
    _postChanged() {
        this._refresh();
    }
    _newImage() {
        window.appGlobals.activity('open', 'newUserImage');
        /*window.appDialogs.getDialogAsync('userImageEdit', (dialog: YpPostUserImageEdit) => {
          dialog.setup(this.post!, undefined, true, this._refresh.bind(this));
          dialog.open(true, { postId: this.post!.id, userImages: true });
        });*/
    }
};
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], YpPostUserImages.prototype, "images", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpPostUserImages.prototype, "post", void 0);
YpPostUserImages = __decorate([
    customElement('yp-post-user-images')
], YpPostUserImages);
export { YpPostUserImages };
//# sourceMappingURL=yp-post-user-images.js.map