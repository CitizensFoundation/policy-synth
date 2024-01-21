import { __decorate, __metadata } from "tslib";
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { YpBaseElement } from '../common/yp-base-element.js';
import { ShadowStyles } from '../common/ShadowStyles.js';
import '../yp-magic-text/yp-magic-text.js';
import '@material/web/icon/icon.js';
import { ifDefined } from 'lit/directives/if-defined.js';
let YpPostTags = class YpPostTags extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.autoTranslate = false;
    }
    static get styles() {
        return [
            super.styles,
            ShadowStyles,
            css `
        .tagContainer {
          max-width: 480px;
          font-size: 14px;
          margin-left: 8px;
          vertical-align: middle;
          padding-left: 16px;
          color: var(--app-tags-text-color, #111) !important;
          font-weight: var(--app-tags-font-weight, 500);
        }

        .middleDot {
          padding-left: 2px;
          padding-right: 2px;
          vertical-align: middle;
          color: var(--app-tags-color, #656565);
        }

        .tagItem {
          vertical-align: middle;
        }

        @media (max-width: 800px) {
          .middleDot {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .tagContainer {
            font-size: 17px;
            padding-left: 16px;
            padding-right: 16px;
            padding-bottom: 16px;
          }
        }

        [hidden] {
          display: none !important;
        }
      `,
        ];
    }
    render() {
        return html `
      <div class="tagContainer wrap">
        ${this.postTags.map((item, index) => html `
            <span class="tagItem">${this._trimmedItem(item)}</span
            ><span
              class="middleDot"
              ?hidden="${this.computeSpanHidden(this.postTags, index)}"
              >&#9679;</span
            >
          `)}
      </div>

      <yp-magic-text
        id="postTagsTranslations"
        hidden
        content-id="${this.post.id}"
        text-only
        content="${ifDefined(this.post.public_data?.tags)}"
        content-language="${ifDefined(this.post.language)}"
        @new-translation="${this._newTranslation}"
        text-type="postTags"
      >
      </yp-magic-text>
    `;
    }
    _trimmedItem(item) {
        if (item) {
            return item.trim();
        }
        else {
            return '';
        }
    }
    _autoTranslateEvent(event) {
        this.autoTranslate = event.detail;
    }
    computeSpanHidden(items, index) {
        return items.length - 1 === index;
    }
    _newTranslation() {
        setTimeout(() => {
            const tagsTranslation = this.$$('#postTagsTranslations');
            if (tagsTranslation && tagsTranslation.finalContent) {
                this.translatedTags = tagsTranslation.finalContent;
            }
        });
    }
    get postTags() {
        if (this.translatedTags && this.autoTranslate) {
            return this.translatedTags.split(',');
        }
        else if (this.post &&
            this.post.public_data &&
            this.post.public_data.tags) {
            return this.post.public_data.tags.split(',');
        }
        else {
            return [];
        }
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpPostTags.prototype, "post", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], YpPostTags.prototype, "translatedTags", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], YpPostTags.prototype, "autoTranslate", void 0);
YpPostTags = __decorate([
    customElement('yp-post-tags')
], YpPostTags);
export { YpPostTags };
//# sourceMappingURL=yp-post-tags.js.map