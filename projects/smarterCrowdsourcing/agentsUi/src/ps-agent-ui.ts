import { html, css, nothing, TemplateResult } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';

import '@material/web/menu/menu.js';

import '@yrpri/webapp/common/yp-image.js';

import { Layouts } from './flexbox-literals/classes.js';

import './policies/ps-web-research.js';

import { PsServerApi } from './base/PsServerApi.js';
import { PsAppGlobals } from './base/PsAppGlobals.js';
import { MdNavigationDrawer } from '@material/web/labs/navigationdrawer/navigation-drawer.js';
import { NavigationBar } from '@material/web/labs/navigationbar/internal/navigation-bar.js';

import { PsAppUser } from './base/PsAppUser.js';

import './ps-home.js';

import './policies/ps-problem-statement.js';
import './policies/ps-sub-problems.js';
import './policies/ps-entities.js';
import './policies/ps-solutions.js';
import './policies/ps-policies.js';

import './ltp/ltp-manage-crt.js';

import { PsSolutions } from './policies/ps-solutions.js';
import { TextField } from '@material/web/textfield/internal/text-field.js';
import { Dialog } from '@material/web/dialog/internal/dialog.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/outlined-text-field.js';
import { PsPolicies } from './policies/ps-policies.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
import { YpFormattingHelpers } from '@yrpri/webapp/common/YpFormattingHelpers.js';

const PagesTypes = {
  ProblemStatement: 1,
  SubProblems: 2,
  Entities: 3,
  Solutions: 4,
  PolicyCategories: 5,
  PolicyIdeas: 6,
};

declare global {
  interface Window {
    psAppGlobals: PsAppGlobals;
    psServerApi: PsServerApi;
  }
}

@customElement('ps-app')
export class PolicySynthWebApp extends YpBaseElement {
  @property({ type: Number })
  currentProjectId: number | undefined = undefined;

  @property({ type: Number })
  activeSubProblemIndex: number | undefined;

  @property({ type: Number })
  activePopulationIndex: number | undefined;

  @property({ type: Number })
  activeSolutionIndex: number | undefined;

  @property({ type: Number })
  activePolicyIndex: number | undefined;

  @property({ type: Number })
  pageIndex = PagesTypes.Solutions;

  @property({ type: Object })
  currentMemory: PsSmarterCrowdsourcingMemoryData | undefined;

  @property({ type: Number })
  totalNumberOfVotes = 0;

  @property({ type: Boolean })
  showAllCosts = false;

  @property({ type: String })
  currentError: string | undefined;

  @property({ type: Boolean })
  isAdmin = false;

  @property({ type: Number })
  numberOfSolutionsGenerations = 0;

  @property({ type: Number })
  numberOfPoliciesIdeasGeneration = 0;

  @property({ type: Number })
  totalSolutions = 0;

  @property({ type: Number })
  totalPros = 0;

  @property({ type: Number })
  totalCons = 0;

  drawer: MdNavigationDrawer;

  constructor(memory: PsSmarterCrowdsourcingMemoryData) {
    super();
    this.currentMemory = memory;
    this.activeSubProblemIndex = null;
    this.activePopulationIndex = null;
    this.activeSolutionIndex = null;
    this.activePolicyIndex = null;

    window.psAppGlobals.activity('pageview');
  }

  renderSolutionPage() {
    return this.renderContentOrLoader(html`
      <div class="layout horizontal">
        ${this.currentMemory
          ? html`
              ${this.renderNavigationBar()}
              <div class="rightPanel">
                <main>
                  <div class="mainPageContainer">
                    <ps-solutions
                      .memory="${this.currentMemory}"
                      .activeSubProblemIndex="${this.activeSubProblemIndex}"
                      .activePopulationIndex="${this.activePopulationIndex}"
                      .activeSolutionIndex="${this.activeSolutionIndex}"
                      @update-route="${this.updateActiveSolutionIndexes}"
                      .router="${this.router}"
                    ></ps-solutions>
                  </div>
                </main>
              </div>
            `
          : nothing}
      </div>
    `);
  }

  renderPoliciesPage() {
    return this.renderContentOrLoader(html`
      <div class="layout horizontal">
        ${this.currentMemory
          ? html`
              ${this.renderNavigationBar()}
              <div class="rightPanel">
                <main>
                  <div class="mainPageContainer">
                    <ps-policies
                      .memory="${this.currentMemory}"
                      .activeSubProblemIndex="${this.activeSubProblemIndex}"
                      .activePopulationIndex="${this.activePopulationIndex}"
                      .activePolicyIndex="${this.activePolicyIndex}"
                      @update-route="${this.updateActivePolicyIndexes}"
                      .router="${this.router}"
                    ></ps-policies>
                  </div>
                </main>
              </div>
            `
          : nothing}
      </div>
    `);
  }


  parseAllActiveIndexes(params: any) {
    this.activeSubProblemIndex = params.subProblemIndex
      ? parseInt(params.subProblemIndex, 10)
      : null;
    this.activePopulationIndex = params.populationIndex
      ? parseInt(params.populationIndex, 10)
      : null;
    this.activeSolutionIndex = params.solutionIndex
      ? parseInt(params.solutionIndex, 10)
      : null;
    this.activePolicyIndex = params.policyIndex
      ? parseInt(params.policyIndex, 10)
      : null;
  }

  router: PsRouter = new PsRouter(
    this,
    [
      {
        path: '/',
        render: () => {
          return html`<ps-home .memory="${this.currentMemory}"></ps-home>`;
        },
      },
      // Next two are depricated
      {
        path: '/projects/:projectId',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );
          return this.renderSolutionPage();
        },
      },
      {
        path: '/projects/:projectId/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );

          return this.renderSolutionPage();
        },
      },
      {
        path: '/solutions/:projectId',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );
          return this.renderSolutionPage();
        },
      },
      {
        path: '/solutions/:projectId/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );

          return this.renderSolutionPage();
        },
      },
      {
        path: '/crt/:treeId/',
        render: params => {
          return this.renderCrtPage(params.treeId);
        },
      },
      {
        path: '/crt/:treeId',
        render: params => {
          return this.renderCrtPage(params.treeId);
        },
      },
      {
        path: '/crt',
        render: params => {
          return this.renderCrtPage();
        },
      },
      {
        path: '/crt/',
        render: params => {
          return this.renderCrtPage();
        },
      },
      {
        path: '/policies/:projectId',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );
          return this.renderPoliciesPage();
        },
      },
      {
        path: '/policies/:projectId/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );

          return this.renderPoliciesPage();
        },
      },
      {
        path: '/projects/:projectId/refresh827cDb',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1,
            true
          );
          return this.renderSolutionPage();
        },
      },
      // Next two are depricated but kept of backwards compatibility
      {
        path: '/projects/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderSolutionPage();
        },
      },
      {
        path: '/projects/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderSolutionPage();
        },
      },
      {
        path: '/solutions/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderSolutionPage();
        },
      },
      {
        path: '/solutions/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderSolutionPage();
        },
      },
      {
        path: '/policies/:projectId/:subProblemIndex?/:populationIndex?/:policyIndex?',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderPoliciesPage();
        },
      },
      {
        path: '/policies/:projectId/:subProblemIndex?/:populationIndex?/:policyIndex?/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );
          this.parseAllActiveIndexes(params);
          return this.renderPoliciesPage();
        },
      },
      {
        path: '/webResearch/:projectId',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );

          return this.renderWebResearchPage();
        },
      },
      {
        path: '/webResearch/:projectId/',
        render: params => {
          this.setupCurrentProjectFromRoute(
            parseInt(params.projectId, 10) || 1
          );

          return this.renderWebResearchPage();
        },
      },
    ],
    {
      fallback: {
        render: () => html`<h2>Page not found</h2>`,
      },
    }
  );

  renderCrtPage(treeId: string | undefined = undefined) {
    return html`
      <ltp-manage-crt
        .currentTreeId="${treeId}"
        .themeDarkMode="${this.themeDarkMode}"
        ="${treeId}"
      ></ltp-manage-crt>
    `;
  }

  renderWebResearchPage() {
    return this.renderContentOrLoader(html`
      <div class="layout horizontal">
        ${this.currentMemory
          ? html`
              ${this.renderNavigationBar()}
              <div class="rightPanel">
                <main>
                  <div class="mainPageContainer">
                    <ps-web-research
                      .memory="${this.currentMemory}"
                      .router="${this.router}"
                    ></ps-web-research>
                  </div>
                </main>
              </div>
            `
          : nothing}
      </div>
    `);
  }

  getServerUrlFromClusterId(clusterId: number) {
    if (clusterId == 1) {
      return 'https://betrireykjavik.is/api';
    } else if (clusterId == 3) {
      return 'https://ypus.org/api';
    } else {
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

  openTempPassword() {
    this.tempPassword = undefined;
    (this.$$('#tempPassword') as TextField).value = '';
    (this.$$('#tempPasswordDialog') as Dialog).open = true;
  }

  async boot() {
    window.psAppGlobals.activity('Boot - fetch start');
    const firstBootResponse = (await window.psServerApi.getProject(
      this.currentProjectId,
      this.tempPassword,
      location.pathname.indexOf('refresh827cDb') > -1 ? '999' : undefined
    )) as CpsBootResponse | { needsTrm: boolean };

    if (firstBootResponse && 'needsTrm' in firstBootResponse) {
      if (this.tempPassword) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      window.psAppGlobals.activity('Boot - needs trm');
      this.openTempPassword();
    } else {
      const bootResponse = firstBootResponse as CpsBootResponse;

      this.currentMemory = bootResponse.currentMemory;

      if (this.currentMemory.subProblems[0].solutions) {
        this.numberOfSolutionsGenerations =
          this.currentMemory.subProblems[0].solutions.populations.length;
      }

      if (this.currentMemory.subProblems[0].policies) {
        this.numberOfPoliciesIdeasGeneration =
          this.currentMemory.subProblems[0].policies.populations.length;
      }

      document.title = bootResponse.name;

      if (bootResponse.isAdmin === true) {
        this.isAdmin = true;
      } else {
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

      for (let subProblem of this.currentMemory.subProblems) {
        if (subProblem.solutions && subProblem.solutions.populations) {
          for (let population of subProblem.solutions.populations) {
            this.totalSolutions += population.length;

            for (let solution of population) {
              if (Array.isArray(solution.pros)) {
                this.totalPros += solution.pros.length;
              }
              if (Array.isArray(solution.cons)) {
                this.totalCons += solution.cons.length;
              }
            }
          }
        }
      }

      window.psAppGlobals.activity('Boot - fetch end');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  getHexColor(color: string) {
    if (color) {
      // Replace all # with nothing
      color = color.replace(/#/g, '');
      if (color.length === 6) {
        return `#${color}`;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  themeChanged(target: HTMLElement | undefined = undefined) {
    let themeCss = {} as any;

    // Save this.themeColor to locale storage
    localStorage.setItem(this.localStorageThemeColorKey, this.themeColor);

    const isDark =
      this.themeDarkMode === undefined
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : this.themeDarkMode;

    if (this.isAppleDevice) {
      const theme = themeFromSourceColor(
        argbFromHex(this.themeColor || this.themePrimaryColor || '#000000'),
        [
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
        ]
      );

      applyTheme(theme, { target: document.body, dark: isDark });
    } else {
      if (this.getHexColor(this.themeColor)) {
        themeCss = themeFromSourceColorWithContrast(
          this.getHexColor(this.themeColor),
          isDark,
          this.themeScheme,
          this.themeHighContrast ? 2.0 : 0.0
        );
      } else {
        themeCss = themeFromSourceColorWithContrast(
          {
            primary: this.getHexColor(this.themePrimaryColor || '#000000'),
            secondary: this.getHexColor(this.themeSecondaryColor || '#000000'),
            tertiary: this.getHexColor(this.themeTertiaryColor || '#000000'),
            neutral: this.getHexColor(this.themeNeutralColor || '#000000'),
          },
          isDark,
          'dynamic',
          this.themeHighContrast ? 2.0 : 0.0
        );
      }

      applyThemeWithContrast(document, themeCss);
    }
  }

  snackbarclosed() {
    this.lastSnackbarText = undefined;
  }

  tabChanged(event: CustomEvent) {
    if (event.detail.activeIndex == 0) {
      this.pageIndex = 1;
    } else if (event.detail.activeIndex == 1) {
      this.pageIndex = 2;
    } else if (event.detail.activeIndex == 2) {
      this.pageIndex = 3;
    } else if (event.detail.activeIndex == 3) {
      this.pageIndex = 4;
    }
  }

  mobileTabChanged(event: CustomEvent) {
    if (event.detail.activeIndex == 3) {
      (event.target as NavigationBar).activeIndex = 1;
    }
    /*
    if (event.detail.activeIndex == 0) {
      this.openSolutions();
    } else if (event.detail.activeIndex == 1) {
      //this.openPolicies();
    } else if (event.detail.activeIndex == 2) {
      this.openWebResearch();
    } else if (event.detail.activeIndex == 3) {
      this.openGitHub();
      (event.target as NavigationBar).activeIndex = 1;
      this.pageIndex = PagesTypes.Solutions;
    }*/
  }

  exitToMainApp() {
    window.location.href = `/`;
  }

  async _displaySnackbar(event: CustomEvent) {
    this.lastSnackbarText = event.detail;
    await this.updateComplete;
    (this.$$('#snackbar') as Snackbar).show();
  }

  _setupEventListeners() {
    this.addListener('app-error', this._appError);
    this.addListener('display-snackbar', this._displaySnackbar);
    this.addListener('toggle-dark-mode', this.toggleDarkMode.bind(this));
    this.addListener(
      'toggle-high-contrast-mode',
      this.toggleHighContrastMode.bind(this)
    );

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
    this.removeListener(
      'toggle-high-contrast-mode',
      this.toggleHighContrastMode.bind(this)
    );
  }

  async updateActiveSolutionIndexes(event: CustomEvent) {
    this.activeSubProblemIndex = event.detail.activeSubProblemIndex;
    this.activePopulationIndex = event.detail.activePopulationIndex;
    this.activeSolutionIndex = event.detail.activeSolutionIndex;
    await this.updateSolutionsRouter();
    /*console.error(
      `updateActiveSolutionIndexes ${this.activeSubProblemIndex} ${this.activePopulationIndex} ${this.activeSolutionIndex}`
    )*/
  }

  async updateActivePolicyIndexes(event: CustomEvent) {
    this.activeSubProblemIndex = event.detail.activeSubProblemIndex;
    this.activePopulationIndex = event.detail.activePopulationIndex;
    this.activePolicyIndex = event.detail.activePolicyIndex;
    await this.updatePoliciesRouter();
  }

  async updatePoliciesRouter() {
    let path: string;
    if (
      this.activePolicyIndex !== null &&
      this.activeSubProblemIndex !== null &&
      this.activePopulationIndex !== null
    ) {
      path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activePolicyIndex}`;
    } else if (
      this.activeSubProblemIndex !== null &&
      this.activePopulationIndex !== null
    ) {
      path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}`;
    } else if (
      this.activeSubProblemIndex !== null &&
      this.activeSubProblemIndex !== undefined
    ) {
      path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}`;
    } else {
      path = `/policies/${this.currentProjectId}`;
    }

    await this.router.goto(path);

    setTimeout(() => {
      if (window.location.pathname != path) {
        history.pushState({}, '', path);
        //console.error(`push state ${path}`)
      }
      this.requestUpdate();
    });
  }

  async updateSolutionsRouter() {
    let path: string;
    if (
      this.activePolicyIndex !== null &&
      this.activeSubProblemIndex !== null &&
      this.activePopulationIndex !== null
    ) {
      path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activePolicyIndex}`;
    } else if (
      this.activeSolutionIndex !== null &&
      this.activeSubProblemIndex !== null &&
      this.activePopulationIndex !== null
    ) {
      path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activeSolutionIndex}`;
    } else if (
      this.activeSubProblemIndex !== null &&
      this.activePopulationIndex !== null
    ) {
      path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}`;
    } else if (
      this.activeSubProblemIndex !== null &&
      this.activeSubProblemIndex !== undefined
    ) {
      path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}`;
    } else {
      path = `/solutions/${this.currentProjectId}`;
    }

    await this.router.goto(path);

    setTimeout(() => {
      if (window.location.pathname != path) {
        history.pushState({}, '', path);
        //console.error(`push state ${path}`)
      }
      this.requestUpdate();
    });
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('themeColor') ||
      changedProperties.has('themeDarkMode')
    ) {
      this.themeChanged();
    }
  }

  _appError(event: CustomEvent) {
    console.error(event.detail.message);
    this.currentError = event.detail.message;
    //(this.$$('#errorDialog') as Dialog).open = true;
  }

  get adminConfirmed() {
    return true;
  }

  static get styles() {
    return [
      Layouts,
      css`
        :host {
          background-color: var(--md-sys-color-background, #fefefe);
        }

        :host {
        }

        .costsContainer {
          margin-top: 32px;
          opacity: 0.7;
          font-size: 13px;
        }

        a {
          color: var(--md-sys-color-on-surface);
          margin-top: 8px;
        }

        body {
          background-color: var(--md-sys-color-background, #fefefe);
        }

        .analyticsHeaderText {
          font-size: var(--md-sys-typescale-headline-large-size, 18px);
          margin-top: 16px;
          margin-bottom: 16px;
        }

        .appTitleContainer {
          margin-bottom: 0px;
          margin-top: 16px;
          font-family: 'Cabin', sans-serif;
          font-size: 22px;
          width: 185px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
        }

        .appTitle {
          padding: 16px;
          margin-left: 4px;
          padding-top: 20px;
        }

        md-outlined-text-field {
          margin: 32px;
        }

        md-elevated-button {
          margin-bottom: 16px;
        }

        .ypLogo {
          margin-top: 16px;
        }

        .rightPanel {
          width: 100%;
        }

        .drawer {
          margin-left: 16px;
          padding-left: 8px;
          margin-right: 16px;
          padding-bottom: 560px;
        }

        .costItem {
          margin-bottom: 8px;
          margin-left: 8px;
          color: var(--md-sys-color-on-surface);
        }

        .statsItem {
          margin-bottom: 6px;
          margin-left: 8px;
          color: var(--md-sys-color-on-surface);
        }

        .statsContainer {
          margin-bottom: 16px;
        }

        .selectedContainer {
          /*--md-list-item-list-item-container-color: var(--md-sys-color-surface-variant);*/
          color: var(--md-sys-color-primary);
          --md-list-item-list-item-label-text-color: var(
            --md-sys-color-primary
          );
          --md-list-item-list-item-focus-label-text-color: var(
            --md-sys-color-primary
          );
          --md-list-item-label-text-color: var(--md-sys-color-primary);
        }

        md-navigation-drawer {
          --md-navigation-drawer-container-color: var(--md-sys-color-surface);
        }

        md-list {
          --md-list-container-color: var(--md-sys-color-surface);
        }

        md-navigation-bar {
          --md-navigation-bar-container-color: var(--md-sys-color-surface);
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
        }

        .lightDarkContainer {
          padding-left: 8px;
          padding-right: 8px;
          color: var(--md-sys-color-on-background);
          font-size: 14px;
        }

        .darkModeButton {
          margin: 16px;
        }

        .topAppBar {
          border-radius: 48px;
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          margin-top: 32px;
          padding: 0px;
          padding-left: 32px;
          padding-right: 32px;
          text-align: center;
        }

        .collectionLogoImage {
          width: 185px;
          height: 104px;
          margin-top: -1px;
        }

        .mainPageContainer {
          margin-top: 16px;
        }

        .version {
          margin: 8px;
          margin-top: 32px;
          font-size: 12px;
          margin-bottom: 32px;
          color: var(--md-sys-color-on-surface);
        }

        .navContainer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 7;
        }

        [hidden] {
          display: none !important;
        }

        md-text-button {
          --md-text-button-label-text-color: #fefefe;
        }

        md-icon-button {
          --md-icon-button-unselected-icon-color: #f0f0f0;
        }


        @media (max-width: 960px) {
          .appTitleContainer {
            margin-top: 32px;
          }
          .mainPageContainer {
            max-width: 100%;
            width: 100%;
            margin-bottom: 96px;
            margin-top: 0;
          }

          prompt-promotion-dashboard {
            max-width: 100%;
          }
        }
      `,
    ];
  }

  changeTabTo(tabId: number) {
    this.tabChanged({ detail: { activeIndex: tabId } } as CustomEvent);
  }


  toCamelCase(str: string) {
    return str.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  }

  renderStats() {
    return html`
      <div class="layout vertical statsContainer">
        <div class="statsItem">
          ${this.t('Total solutions')}:
          ${YpFormattingHelpers.number(this.totalSolutions)}
        </div>
        <div class="statsItem">
          ${this.t('Total pros')}: ${YpFormattingHelpers.number(this.totalPros)}
        </div>
        <div class="statsItem">
          ${this.t('Total cons')}: ${YpFormattingHelpers.number(this.totalCons)}
        </div>
        <div class="statsItem">
          ${this.t('Solutions generations')}:
          ${YpFormattingHelpers.number(this.numberOfSolutionsGenerations)}
        </div>
        <div class="statsItem">
          ${this.t('Policies generations')}:
          ${YpFormattingHelpers.number(this.numberOfPoliciesIdeasGeneration)}
        </div>
      </div>
    `;
  }

  renderContentOrLoader(content: TemplateResult) {
    if (this.currentMemory) {
      return content;
    } else {
      return html`
        <div class="loading">
          <md-circular-progress indeterminate></md-circular-progress>
        </div>
      `;
    }
  }

  handleShowMore(event: CustomEvent) {
    event.preventDefault();
    this.showAllCosts = true;
  }

  getCustomVersion(version: string) {
    const date = new Date();

    const formattedDate = date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `Built on ${formattedDate} CET`;
  }


  renderLogo() {
    return html`
      <div class="appTitleContainer">
        <div class="appTitle">${this.t('POLICY SYNTH')}</div>
      </div>
      <yp-image
        class="collectionLogoImage"
        sizing="contain"
        src="https://yrpri-usa-production-direct-assets.s3.amazonaws.com/Robert_Bjarnason_High_quality_abstract_new_high_tech_new_wave.__61a9b3d8-7533-4841-a99e-ef036fed1fbf.png"
      ></yp-image>
    `;
  }

  async openSolutions() {
    this.activeSolutionIndex = null;
    this.activeSubProblemIndex = null;
    this.activePopulationIndex = null;
    this.updateSolutionsRouter();
    await this.updateComplete;
    (this.$$('ps-solutions') as PsSolutions)?.reset();
  }

  async openPolicies() {
    this.activePolicyIndex = null;
    this.activeSolutionIndex = null;
    this.activeSubProblemIndex = null;
    this.activePopulationIndex = null;
    this.updatePoliciesRouter();
    await this.updateComplete;
    (this.$$('ps-policies') as PsPolicies)?.reset();
  }

  async openWebResearch() {
    const path = `/webResearch/${this.currentProjectId}`;
    this.router.goto(path);
    setTimeout(() => {
      if (window.location.pathname != path) {
        history.pushState({}, '', path);
        //console.error(`push state ${path}`)
      }
      this.requestUpdate();
    });
  }

  renderNavigationBar() {
    if (this.wide) {
      return html`
        <div class="drawer">
          <div class="layout horizontal headerContainer center-center">
            <div class="analyticsHeaderText layout vertical center-center">
              ${this.renderLogo()}
            </div>
          </div>

          <md-list>
            <md-list-item
              type="button"
              class="${
                location.href.indexOf('/webResearch') > -1 &&
                'selectedContainer'
              }"

              @click="${() => this.openWebResearch()}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openWebResearch();
                }
              }}"

            >
              <div slot="headline">${this.t('Web Research')}</div>
              <div slot="supporting-text">${this.t('Automated')}</div>
              <md-icon slot="start">manage_search</md-icon>
            </md-list-item>
            <md-list-item
              type="button"
              class="${
                location.href.indexOf('/solutions') > -1 && 'selectedContainer'
              }"

              @click="${async () => {
                this.openSolutions();
                setTimeout(() => {
                  this.requestUpdate();
                });
              }}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openSolutions();
                }
              }}"
            >
              <div slot="headline">${this.t('Solutions')}</div>
              <div slot="supporting-text">${
                this.numberOfSolutionsGenerations
              } generations</div>
              <md-icon slot="start">online_prediction</md-icon>
            </md-list-item>
            <md-list-item hidden
              type="button"
              class="${
                this.pageIndex == PagesTypes.PolicyCategories &&
                'selectedContainer'
              }"
            >
              <div slot="headline">${this.t('Policy categories')}</div>
              <div slot="supporting-text">${this.t('Policy categories')}</div>
              <md-icon slot="start">category</md-icon>
            </md-list-item>

            <md-list-item
              type="button"
              class="${
                this.pageIndex == PagesTypes.PolicyCategories &&
                'selectedContainer'
              }"

              @click="${async () => {
                this.openPolicies();
                setTimeout(() => {
                  this.requestUpdate();
                });
              }}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openPolicies();
                }
              }}"
            >
              <div slot="headline">${this.t('Policy ideas')}</div>
              <div slot="supporting-text">${
                this.numberOfPoliciesIdeasGeneration
              } generations</div>
              <md-icon slot="start">policy</md-icon>
            </md-list-item>

            <md-list-divider></md-list-divider>
            <md-list-item
              type="button"
              ?hidden="${true /*!this.isAdmin*/}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openAnalytics();
                }
              }}"
              @click="${this.openAnalytics}"
            >
              <div slot="headline">${this.t('Analytics')}</div>
              <div slot="supporting-text">${this.t('Admin analytics')}</div>
              <md-icon slot="start">monitoring</md-icon>
            </md-list-item>
            <md-list-item
              type="button"
              ?hidden="${true /*!this.isAdmin*/}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.goToAdmin();
                }
              }}"
              @click="${this.goToAdmin}"
            >
              <div slot="headline">${this.t('Administration')}</div>
              <div slot="supporting-text">${this.t(
                'Administer the process'
              )}</div>
              <md-icon slot="start">settings</md-icon>
            </md-list-item>
            <md-list-divider></md-list-divider>
            <md-list-item
              type="button"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openGitHub();
                }
              }}"
              @click="${this.openGitHub}"
            >
              <div slot="headline">${this.t('Open Source')}</div>
              <div slot="supporting-text">${this.t('Join us!')}</div>
              <md-icon slot="start">crowdsource</md-icon></md-list-item>
            </md-list-item>
            <div class="layout horizontal center-center">
              ${this.renderThemeToggle()}
            </div>
          </md-list>
          <div class="version">__VERSION__</div>
          </div>
        </div>
      `;
    } else {
      return html`
        <div class="navContainer">
          <md-navigation-bar
            id="navBar"
            activeIndex="1"
            @navigation-bar-activated="${this.mobileTabChanged}"
          >
            <md-navigation-tab
              @click="${this.openWebResearch}"
              .label="${this.t('Web Searches')}"
              ><md-icon slot="activeIcon">manage_search</md-icon>
              <md-icon slot="inactiveIcon"
                >manage_search</md-icon
              ></md-navigation-tab
            >
            <md-navigation-tab
              @click="${this.openSolutions}"
              .label="${this.t('Solutions')}"
              ><md-icon slot="activeIcon">online_prediction</md-icon>
              <md-icon slot="inactiveIcon"
                >online_prediction</md-icon
              ></md-navigation-tab
            >
            <md-navigation-tab .label="${this.t('Policies')}"
              ><md-icon slot="activeIcon">policy</md-icon>
              <md-icon slot="inactiveIcon">policy</md-icon></md-navigation-tab
            >
            <md-navigation-tab
              @click="${this.openGitHub}"
              .label="${this.t('Open Source')}"
              ><md-icon slot="activeIcon">crowdsource</md-icon>
              <md-icon slot="inactiveIcon"
                >crowdsource</md-icon
              ></md-navigation-tab
            >
          </md-navigation-bar>
        </div>
      `;
    }
  }



  render() {
    return html`
    ${this.router.outlet()}

    </div>
      `;
  }
}
