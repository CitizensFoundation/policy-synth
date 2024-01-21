import { __decorate, __metadata } from "tslib";
import { html, css, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { YpBaseElement } from '../common/yp-base-element.js';
import { ShadowStyles } from '../common/ShadowStyles.js';
import { YpIronListHelpers } from '../common/YpIronListHelpers.js';
import { YpCollectionHelpers } from '../common/YpCollectionHelpers.js';
import { FlowLayout } from '@lit-labs/virtualizer/layouts/flow.js';
import { GridLayout } from '@lit-labs/virtualizer/layouts/grid.js';
import './yp-collection-item-card.js';
let YpCollectionItemsGrid = class YpCollectionItemsGrid extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.grid = false;
        this.skipIronListWidth = false;
    }
    static get styles() {
        return [
            super.styles,
            ShadowStyles,
            css `
        .card {
          padding: 0;
          padding-top: 24px;
          width: 100%;
        }

        .card[wide-padding] {
          padding: 16px !important;
        }

        a {
          text-decoration: none;
          width: 100%;
        }
      `,
        ];
    }
    render() {
        return this.sortedCollectionItems
            ? html `
          <lit-virtualizer
            id="list"
            role="main"
            .layout="${this.grid ? GridLayout : FlowLayout}"
            aria-label="${this.t(this.pluralItemType)}"
            .items="${this.sortedCollectionItems}"
            .scrollTarget="${window}"
            .keyFunction="${(item) => item.id}"
            .renderItem="${this.renderItem.bind(this)}"></lit-virtualizer>
        `
            : nothing;
    }
    renderItem(item, index) {
        return html ` <yp-collection-item-card
      class="card"
      aria-label="${item.name}"
      ariarole="listitem"
      .item="${item}"
      @keypress="${this._keypress.bind(this)}"
      @click="${this._selectedItemChanged.bind(this)}"></yp-collection-item-card>`;
    }
    get pluralItemType() {
        if (this.collectionItemType == 'community') {
            return 'communities';
        }
        else if (this.collectionItemType == 'group') {
            return 'groups';
        }
        else if (this.collectionItemType == 'post') {
            return 'posts';
        }
        else {
            return 'unknownItemType';
        }
    }
    _keypress(event) {
        if (event.keyCode == 13) {
            this._selectedItemChanged(event);
        }
    }
    async refresh() { }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        //TODO: Remove unknown cast
        YpIronListHelpers.attachListeners(this);
    }
    async connectedCallback() {
        super.connectedCallback();
        if (this.collection && this.collectionItems) {
            const splitCommunities = YpCollectionHelpers.splitByStatus(this.collectionItems, this.collection.configuration);
            this.sortedCollectionItems = splitCommunities.featured.concat(splitCommunities.active.concat(splitCommunities.archived));
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        //TODO: Remove unknown cast
        YpIronListHelpers.detachListeners(this);
    }
    // TODO: Make sure this fires each time on keyboard, mouse & phone - make sure back key on browser works also just with the A
    _selectedItemChanged(event) {
        const item = event.target.item;
        if (this.collectionItemType && item) {
            window.appGlobals.activity('open', this.collectionItemType, `/${this.collectionItemType}/${item.id}`, { id: item.id });
            if (this.collectionItemType === 'community') {
                const community = item;
                if (community != undefined) {
                    window.appGlobals.cache.backToDomainCommunityItems[community.domain_id] = community;
                }
            }
            else if (this.collectionItemType === 'group' && item) {
                const group = item;
                window.appGlobals.cache.backToCommunityGroupItems[group.community_id] = group;
                window.appGlobals.cache.groupItemsCache[group.id] = group;
            }
        }
    }
    scrollToItem(item) {
        if (item && this.sortedCollectionItems) {
            for (let i = 0; i < this.sortedCollectionItems.length; i++) {
                if (this.sortedCollectionItems[i] == item) {
                    this.$$('#list').scrollToIndex(i);
                    break;
                }
            }
            this.fireGlobal('yp-refresh-activities-scroll-threshold');
        }
        else {
            console.error('No item to scroll too');
        }
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpCollectionItemsGrid.prototype, "collection", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], YpCollectionItemsGrid.prototype, "collectionItems", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], YpCollectionItemsGrid.prototype, "collectionItemType", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], YpCollectionItemsGrid.prototype, "sortedCollectionItems", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    __metadata("design:type", Object)
], YpCollectionItemsGrid.prototype, "grid", void 0);
YpCollectionItemsGrid = __decorate([
    customElement('yp-collection-items-grid')
], YpCollectionItemsGrid);
export { YpCollectionItemsGrid };
//# sourceMappingURL=yp-collection-items-grid.js.map