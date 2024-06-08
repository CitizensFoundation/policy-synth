var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import 'urlpattern-polyfill';
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
//import '@material/web/labs/navigationdrawer/lib/navigation-drawer-styles.css.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/mwc-snackbar/mwc-snackbar.js';
import { applyTheme, argbFromHex, themeFromSourceColor, } from '@material/material-color-utilities';
import '@material/web/menu/menu.js';
import '@yrpri/webapp/common/yp-image.js';
//import './chat/yp-chat-assistant.js';
import { Layouts } from './flexbox-literals/classes.js';
import './policies/ps-web-research.js';
import { PsServerApi } from './base/PsServerApi.js';
import { PsAppGlobals } from './base/PsAppGlobals.js';
import { PsAppUser } from './base/PsAppUser.js';
import './ps-home.js';
import './operations/ps-operations-manager.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/outlined-text-field.js';
import { applyThemeWithContrast, themeFromSourceColorWithContrast, } from '@yrpri/webapp/common/YpMaterialThemeHelper.js';
import { PsRouter } from './base/router/router.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
const PagesTypes = {
    AgentsView: 1,
};
let PsAgentOperationsWebApp = class PsAgentOperationsWebApp extends YpBaseElement {
    constructor() {
        super();
        this.currentProjectId = undefined;
        this.pageIndex = PagesTypes.AgentsView;
        this.totalNumberOfVotes = 0;
        this.showAllCosts = false;
        this.collectionType = 'domain';
        this.localStorageThemeColorKey = 'md3-ps-theme-color-v2';
        this.themeColor = '#df2302';
        this.themePrimaryColor = '#000000';
        this.themeSecondaryColor = '#000000';
        this.themeTertiaryColor = '#000000';
        this.themeNeutralColor = '#000000';
        this.themeNeutralVariantColor = '#000000';
        this.themeScheme = 'tonal';
        this.themeHighContrast = false;
        this.isAdmin = false;
        this.surveyClosed = false;
        this.numberOfSolutionsGenerations = 0;
        this.numberOfPoliciesIdeasGeneration = 0;
        this.totalSolutions = 0;
        this.totalPros = 0;
        this.totalCons = 0;
        this.router = new PsRouter(this, [
            {
                path: '/',
                render: () => {
                    return html `<ps-home .memory="${this.currentMemory}"></ps-home>`;
                },
            },
            {
                path: '/agent/:agentId/',
                render: params => {
                    return this.renderAgentPage(params.agentId);
                },
            },
            {
                path: '/agent/:agentId',
                render: params => {
                    return this.renderAgentPage(params.agentId);
                },
            },
            {
                path: '/agent',
                render: params => {
                    return this.renderAgentPage();
                },
            },
            {
                path: '/agent/',
                render: params => {
                    return this.renderAgentPage();
                },
            },
        ], {
            fallback: {
                render: () => html `<h2>Page not found</h2>`,
            },
        });
        window.psServerApi = new PsServerApi();
        window.psAppGlobals = new PsAppGlobals(window.psServerApi);
        window.appUser = new PsAppUser(window.psServerApi);
        // Set this.themeDarkMode from localStorage or otherwise to true
        const savedDarkMode = localStorage.getItem('md3-ps-dark-mode');
        if (savedDarkMode) {
            this.themeDarkMode = true;
        }
        else {
            this.themeDarkMode = false;
        }
        const savedHighContrastMode = localStorage.getItem('md3-ps-high-contrast-mode');
        if (savedHighContrastMode) {
            this.themeHighContrast = true;
        }
        else {
            this.themeHighContrast = false;
        }
        window.psAppGlobals.activity('pageview');
        this.setupDebugScroll();
    }
    setupDebugScroll() {
        let isScrolling = false;
        let scrollInterval;
        const startScrolling = () => {
            if (!isScrolling) {
                isScrolling = true;
                scrollInterval = setInterval(() => {
                    window.scrollBy(0, 1); // Scroll down by 10 pixels
                }, 4); // Every 100 milliseconds
            }
        };
        const stopScrolling = () => {
            if (isScrolling) {
                clearInterval(scrollInterval);
                isScrolling = false;
            }
        };
        window.addEventListener('keydown', event => {
            if (event.key === 's' && !isScrolling) {
                startScrolling();
            }
        });
        window.addEventListener('keyup', event => {
            if (event.key === 's') {
                stopScrolling();
            }
        });
    }
    renderAgentPage(agentId = undefined) {
        return html `
      <ps-operations-manager
        .currentAgentId="${agentId}"
        ="${treeId}"
      ></ps-operations-manager>
    `;
    }
    getServerUrlFromClusterId(clusterId) {
        if (clusterId == 1) {
            return 'https://betrireykjavik.is/api';
        }
        else if (clusterId == 3) {
            return 'https://ypus.org/api';
        }
        else {
            return 'https://yrpri.org/api';
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this._setupEventListeners();
        const savedColor = localStorage.getItem(this.localStorageThemeColorKey);
        if (savedColor) {
            this.fireGlobal('yp-theme-color', savedColor);
        }
        this.setupTheme();
    }
    async boot() {
        window.psAppGlobals.activity('Boot - fetch start');
        const firstBootResponse = (await window.psServerApi.getProject(this.currentProjectId, this.tempPassword, location.pathname.indexOf('refresh827cDb') > -1 ? '999' : undefined));
        if (firstBootResponse && 'needsTrm' in firstBootResponse) {
            if (this.tempPassword) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            window.psAppGlobals.activity('Boot - needs trm');
        }
        else {
            const bootResponse = firstBootResponse;
            this.currentMemory = bootResponse.currentMemory;
            document.title = bootResponse.name;
            if (bootResponse.isAdmin === true) {
                this.isAdmin = true;
            }
            else {
                this.isAdmin = false;
            }
            this.themeColor = bootResponse.configuration.theme_color
                ? bootResponse.configuration.theme_color
                : '#df2302';
            this.themePrimaryColor = bootResponse.configuration.theme_primary_color;
            this.themeSecondaryColor =
                bootResponse.configuration.theme_secondary_color;
            this.themeTertiaryColor = bootResponse.configuration.theme_tertiary_color;
            this.themeNeutralColor = bootResponse.configuration.theme_neutral_color;
            this.themeScheme = bootResponse.configuration.theme_scheme
                ? bootResponse.configuration.theme_scheme.toLowerCase()
                : 'tonal';
            this.themeChanged();
            window.psAppGlobals.activity('Boot - fetch end');
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
    getHexColor(color) {
        if (color) {
            // Replace all # with nothing
            color = color.replace(/#/g, '');
            if (color.length === 6) {
                return `#${color}`;
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    themeChanged(target = undefined) {
        let themeCss = {};
        // Save this.themeColor to locale storage
        localStorage.setItem(this.localStorageThemeColorKey, this.themeColor);
        const isDark = this.themeDarkMode === undefined
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : this.themeDarkMode;
        if (this.isAppleDevice) {
            const theme = themeFromSourceColor(argbFromHex(this.themeColor || this.themePrimaryColor || '#000000'), [
                {
                    name: 'up-vote',
                    value: argbFromHex('#0F0'),
                    blend: true,
                },
                {
                    name: 'down-vote',
                    value: argbFromHex('#F00'),
                    blend: true,
                },
            ]);
            applyTheme(theme, { target: document.body, dark: isDark });
        }
        else {
            if (this.getHexColor(this.themeColor)) {
                themeCss = themeFromSourceColorWithContrast(this.getHexColor(this.themeColor), this.themeVariant, isDark, this.themeScheme, this.themeHighContrast ? 2.0 : 0.0);
            }
            else {
                themeCss = themeFromSourceColorWithContrast({
                    primary: this.getHexColor(this.themePrimaryColor || '#000000'),
                    secondary: this.getHexColor(this.themeSecondaryColor || '#000000'),
                    tertiary: this.getHexColor(this.themeTertiaryColor || '#000000'),
                    neutral: this.getHexColor(this.themeNeutralColor || '#000000'),
                    neutralVariant: this.getHexColor(this.themeNeutralVariantColor || '#000000'),
                }, this.themeVariant, isDark, 'dynamic', this.themeHighContrast ? 2.0 : 0.0);
            }
            applyThemeWithContrast(document, themeCss);
        }
    }
    snackbarclosed() {
        this.lastSnackbarText = undefined;
    }
    async _displaySnackbar(event) {
        this.lastSnackbarText = event.detail;
        await this.updateComplete;
        //(this.$$('#snackbar') as Snackbar).show();
    }
    _setupEventListeners() {
        this.addListener('app-error', this._appError);
        this.addListener('display-snackbar', this._displaySnackbar);
        this.addListener('toggle-dark-mode', this.toggleDarkMode.bind(this));
        this.addListener('toggle-high-contrast-mode', this.toggleHighContrastMode.bind(this));
        window.addEventListener('popstate', () => {
            //console.error(`pop state ${window.location.pathname}`)
            this.router.goto(window.location.pathname);
            this.requestUpdate();
        });
    }
    _removeEventListeners() {
        this.removeListener('display-snackbar', this._displaySnackbar);
        this.removeListener('app-error', this._appError);
        this.removeListener('toggle-dark-mode', this.toggleDarkMode.bind(this));
        this.removeListener('toggle-high-contrast-mode', this.toggleHighContrastMode.bind(this));
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('themeColor') ||
            changedProperties.has('themeDarkMode')) {
            this.themeChanged();
        }
    }
    _appError(event) {
        console.error(event.detail.message);
        this.currentError = event.detail.message;
        //(this.$$('#errorDialog') as Dialog).open = true;
    }
    get adminConfirmed() {
        return true;
    }
    _settingsColorChanged(event) {
        this.fireGlobal('yp-theme-color', event.detail.value);
    }
    static get styles() {
        return [
            Layouts,
            css `
      `,
        ];
    }
    updateThemeColor(event) {
        this.themeColor = event.detail;
    }
    toggleDarkMode() {
        this.themeDarkMode = !this.themeDarkMode;
        if (this.themeDarkMode) {
            window.psAppGlobals.activity('Settings - dark mode');
            localStorage.setItem('md3-ps-dark-mode', 'true');
        }
        else {
            window.psAppGlobals.activity('Settings - light mode');
            localStorage.removeItem('md3-ps-dark-mode');
        }
        this.themeChanged();
    }
    toggleHighContrastMode() {
        this.themeHighContrast = !this.themeHighContrast;
        if (this.themeHighContrast) {
            window.psAppGlobals.activity('Settings - high contrast mode');
            localStorage.setItem('md3-ps-high-contrast-mode', 'true');
        }
        else {
            window.psAppGlobals.activity('Settings - non high contrast mode');
            localStorage.removeItem('md3-ps-high-contrast-mode');
        }
        this.themeChanged();
    }
    setupTheme() {
        // Read dark mode and theme from localestore and set this.themeDarkMode and this.themeColor and change the theme
        const savedDarkMode = localStorage.getItem('md3-ps-dark-mode');
        if (savedDarkMode) {
            this.themeDarkMode = true;
        }
        else {
            this.themeDarkMode = false;
        }
        const savedHighContrastMode = localStorage.getItem('md3-ps-high-contrast-mode');
        if (savedHighContrastMode) {
            this.themeHighContrast = true;
        }
        else {
            this.themeHighContrast = false;
        }
        const savedThemeColor = localStorage.getItem(this.localStorageThemeColorKey);
        if (savedThemeColor) {
            this.themeColor = savedThemeColor;
        }
        this.fire('yp-theme-dark-mode', this.themeDarkMode);
        this.themeChanged();
    }
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    }
    renderContentOrLoader(content) {
        if (this.currentMemory) {
            return content;
        }
        else {
            return html `
        <div class="loading">
          <md-circular-progress indeterminate></md-circular-progress>
        </div>
      `;
        }
    }
    handleShowMore(event) {
        event.preventDefault();
        this.showAllCosts = true;
    }
    renderThemeToggle(hideText = false) {
        return html `<div class="layout vertical center-center lightDarkContainer">
        ${!this.themeDarkMode
            ? html `
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>dark_mode</md-icon></md-outlined-icon-button
              >
            `
            : html `
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>light_mode</md-icon></md-outlined-icon-button
              >
            `}
        <div ?hidden="${hideText}">${this.t('Light/Dark')}</div>
      </div>

      <div
        class="layout vertical center-center lightDarkContainer"
        ?hidden="${this.isAppleDevice}"
      >
        ${!this.themeHighContrast
            ? html `
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleHighContrastMode}"
              ><md-icon>contrast</md-icon></md-outlined-icon-button
            >
          </div> `
            : html `
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleHighContrastMode}"
                ><md-icon>contrast_rtl_off</md-icon></md-outlined-icon-button
              >
            `}
        <div ?hidden="${hideText}">${this.t('Contrast')}</div>
      </div>`;
    }
    render() {
        return html `
    ${this.router.outlet()}

    </div>
      ${this.lastSnackbarText
            ? html `
              <mwc-snackbar
                id="snackbar"
                @MDCSnackbar:closed="${this.snackbarclosed}"
                style="text-align: center;"
                .labelText="${this.lastSnackbarText}"
              ></mwc-snackbar>
            `
            : nothing}
      `;
    }
};
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "currentProjectId", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "activeSubProblemIndex", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "activePopulationIndex", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "activeSolutionIndex", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "activePolicyIndex", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "pageIndex", void 0);
__decorate([
    property({ type: Object })
], PsAgentOperationsWebApp.prototype, "currentMemory", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "totalNumberOfVotes", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentOperationsWebApp.prototype, "showAllCosts", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "lastSnackbarText", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "collectionType", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "earlName", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "currentError", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "forceGetBackupForProject", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "tempPassword", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "localStorageThemeColorKey", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themePrimaryColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeSecondaryColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeTertiaryColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeNeutralColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeNeutralVariantColor", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeScheme", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "themeVariant", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentOperationsWebApp.prototype, "themeHighContrast", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentOperationsWebApp.prototype, "isAdmin", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentOperationsWebApp.prototype, "surveyClosed", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "appearanceLookup", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "currentLeftAnswer", void 0);
__decorate([
    property({ type: String })
], PsAgentOperationsWebApp.prototype, "currentRightAnswer", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "numberOfSolutionsGenerations", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "numberOfPoliciesIdeasGeneration", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "totalSolutions", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "totalPros", void 0);
__decorate([
    property({ type: Number })
], PsAgentOperationsWebApp.prototype, "totalCons", void 0);
PsAgentOperationsWebApp = __decorate([
    customElement('ps-agents-operations-app')
], PsAgentOperationsWebApp);
export { PsAgentOperationsWebApp };
//# sourceMappingURL=ps-app.js.map