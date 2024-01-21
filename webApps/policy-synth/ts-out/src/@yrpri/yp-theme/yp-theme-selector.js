import { __decorate, __metadata } from "tslib";
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { YpBaseElement } from '../common/yp-base-element.js';
//import '@material/mwc-select';
//import '@material/mwc-list/mwc-list-item';
//import { Select } from '@material/mwc-select';
let YpThemeSelector = class YpThemeSelector extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.themes = [];
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('selectedTheme')) {
            this._selectedThemeChanged();
            this.fire('yp-theme-changed', this.selectedTheme);
        }
        if (changedProperties.has('themeObject')) {
            this._objectChanged();
        }
        if (changedProperties.has('themes')) {
            this._objectChanged();
        }
    }
    static get styles() {
        return [
            super.styles,
            css `
        mwc-select {
          max-width: 250px;
          width: 250px;
        }
      `,
        ];
    }
    connectedCallback() {
        super.connectedCallback();
        this.themes = window.appGlobals.theme.themes;
    }
    _selectTheme(event) {
        const target = event.target;
        if (target.id) {
            this.selectedTheme = parseInt(target.id);
        }
    }
    render() {
        return this.themes
            ? html `
          <mwc-select
            id="select"
            .value="${this.selectedTheme
                ? this.selectedTheme.toString()
                : '0'}"
            .label="${this.t('theme.choose')}"
          >
            ${this.themes.map((theme, index) => html `
                <mwc-list-item
                  @click="${this._selectTheme}"
                  id="${index}"
                  .value="${index.toString()}"
                  ?hidden="${theme.disabled}"
                  >${theme.name}</mwc-list-item
                >
              `)}
          </mwc-select>
        `
            : nothing;
    }
    _objectChanged() {
        if (this.themeObject && this.themeObject.theme_id) {
            this.selectedTheme = this.themeObject.theme_id;
        }
    }
    _selectedThemeChanged() {
        if (this.selectedTheme) {
            window.appGlobals.theme.setTheme(this.selectedTheme);
        }
    }
};
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], YpThemeSelector.prototype, "selectedTheme", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpThemeSelector.prototype, "themeObject", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], YpThemeSelector.prototype, "themes", void 0);
YpThemeSelector = __decorate([
    customElement('yp-theme-selector')
], YpThemeSelector);
export { YpThemeSelector };
//# sourceMappingURL=yp-theme-selector.js.map