import { __decorate, __metadata } from "tslib";
import { html, css, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { YpBaseElement } from '../common/yp-base-element.js';
import { YpFormattingHelpers } from '../common/YpFormattingHelpers.js';
import '@material/web/icon/icon.js';
let YpCollectionStats = class YpCollectionStats extends YpBaseElement {
    static get styles() {
        return [
            super.styles,
            css `
        :host {
          display: block;
          width: 100%;
        }

        .stats {
          padding-top: 8px;
          padding-bottom: 0;
          color: var(--mdc-theme-on-surface-lighter);
        }

        .stats-text {
          font-size: 18px;
          text-align: right;
          vertical-align: bottom;
          margin-right: 8px;
          color: var(--mdc-theme-on-surface-lighter);
        }

        .stats-icon {
          margin-left: 8px;
          margin-bottom: 8px;
          margin-right: 8px;
        }
      `,
        ];
    }
    render() {
        return this.collection
            ? html `
          <div class="stats layout horizontal end-justified">
            <div class="layout horizontal">
              <md-icon title="${this.t('stats.posts')}" class="stats-icon bulb"
                >lightbulb_outline</md-icon
              >
              <div title="${this.t('stats.posts')}" class="stats-text">
                ${YpFormattingHelpers.number(this.collection.counter_posts)}
              </div>

              ${this.collectionType === 'community'
                ? html `
                    <md-icon
                      title="${this.t('stats.groups')}"
                      class="stats-icon"
                      >groups</md-icon
                    >
                    <div title="${this.t('stats.groups')}" class="stats-text">
                      ${YpFormattingHelpers.number(this.collection.counter_groups)}
                    </div>
                  `
                : nothing}
              ${this.collectionType === 'domain'
                ? html `
                    <md-icon
                      title="${this.t('stats.communities')}"
                      class="stats-icon"
                      >groups</md-icon
                    >
                    <div
                      title="${this.t('stats.communities')}"
                      class="stats-text">
                      ${YpFormattingHelpers.number(this.collection.counter_communities)}
                    </div>
                  `
                : nothing}

              <md-icon
                title="${this.t('statsPoints')}"
                icon="people"
                class="stats-icon"
                >comment</md-icon
              >
              <div title="${this.t('statsPoints')}" class="stats-text">
                ${YpFormattingHelpers.number(this.collection.counter_points)}
              </div>

              <md-icon
                title="${this.t('stats.users')}"
                icon="face"
                class="stats-icon"
                >person</md-icon
              >
              <div title="${this.t('stats.users')}" class="stats-text">
                ${YpFormattingHelpers.number(this.collection.counter_users)}
              </div>
            </div>
          </div>
        `
            : nothing;
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpCollectionStats.prototype, "collection", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], YpCollectionStats.prototype, "collectionType", void 0);
YpCollectionStats = __decorate([
    customElement('yp-collection-stats')
], YpCollectionStats);
export { YpCollectionStats };
//# sourceMappingURL=yp-collection-stats.js.map