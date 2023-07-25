import { html, css, nothing } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
//import '@material/web/labs/navigationdrawer/lib/navigation-drawer-styles.css.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/standard-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/mwc-snackbar/mwc-snackbar.js';

import {
  applyTheme,
  argbFromHex,
  themeFromSourceColor,
} from '@material/material-color-utilities';

import '@material/web/menu/menu.js';
import { cache } from 'lit/directives/cache.js';

import './src/@yrpri/common/yp-image.js';
import { YpBaseElement } from './src/@yrpri/common/yp-base-element.js';

//import './chat/yp-chat-assistant.js';
import { Layouts } from './src/flexbox-literals/classes.js';

import { CpsServerApi } from './src/CpsServerApi.js';
import { CpsAppGlobals } from './src/CpsAppGlobals.js';
import { MdNavigationDrawer } from '@material/web/labs/navigationdrawer/navigation-drawer.js';
import { Snackbar } from '@material/mwc-snackbar/mwc-snackbar.js';
import { NavigationBar } from '@material/web/labs/navigationbar/lib/navigation-bar.js';
import {
  Scheme,
  applyThemeWithContrast,
  themeFromSourceColorWithContrast,
} from './src/@yrpri/common/YpMaterialThemeHelper.js';
import { CpsAppUser } from './src/CpsAppUser.js';

import './src/cps-problem-statement.js';
import './src/cps-sub-problems.js';
import './src/cps-entities.js';
import './src/cps-solutions.js';
import { IEngineConstants } from './src/constants.js';
import { YpFormattingHelpers } from './src/@yrpri/common/YpFormattingHelpers.js';

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
    appGlobals: any /*CpsAppGlobals*/;
    aoiServerApi: CpsServerApi;
  }
}

const currentMemoryId = 1;

@customElement('cps-app')
export class CpsApp extends YpBaseElement {
  @property({ type: Number })
  pageIndex = 1;

  @property({ type: Object })
  currentMemory: IEngineInnovationMemoryData | undefined;

  @property({ type: Number })
  totalNumberOfVotes = 0;

  @property({ type: Boolean })
  showAllCosts = false;

  @property({ type: String })
  lastSnackbarText: string | undefined;

  @property({ type: String })
  collectionType = 'domain';

  @property({ type: String })
  earlName!: string;

  @property({ type: String })
  currentError: string | undefined;

  @property({ type: String })
  themeColor = '#3858ca';

  @property({ type: String })
  themePrimaryColor = '#000000';

  @property({ type: String })
  themeSecondaryColor = '#000000';

  @property({ type: String })
  themeTertiaryColor = '#000000';

  @property({ type: String })
  themeNeutralColor = '#000000';

  @property({ type: String })
  themeScheme: Scheme = 'tonal';

  @property({ type: Boolean })
  themeHighContrast = false;

  @property({ type: Boolean })
  isAdmin = false;

  @property({ type: Boolean })
  surveyClosed = false;

  @property({ type: String })
  appearanceLookup!: string;

  @property({ type: String })
  currentLeftAnswer: string;

  @property({ type: String })
  currentRightAnswer: string;

  @property({ type: Number })
  numberOfSolutionsGenerations = 0;

  @property({ type: Number })
  currentPolicyIdeasGeneration = 0;

  @property({ type: Number })
  totalSolutions = 0;

  @property({ type: Number })
  totalPros = 0;

  @property({ type: Number })
  totalCons = 0;

  drawer: MdNavigationDrawer;

  constructor() {
    super();

    window.serverApi = new CpsServerApi();
    window.appGlobals = new CpsAppGlobals(window.aoiServerApi);
    window.appUser = new CpsAppUser(window.aoiServerApi);

    // Set this.themeDarkMode from localStorage or otherwise to true
    const savedDarkMode = localStorage.getItem('md3-aoi-dark-mode');
    if (savedDarkMode) {
      this.themeDarkMode = true;
    } else {
      this.themeDarkMode = false;
    }

    const savedHighContrastMode = localStorage.getItem(
      'md3-aoi-high-contrast-mode'
    );
    if (savedHighContrastMode) {
      this.themeHighContrast = true;
    } else {
      this.themeHighContrast = false;
    }

    window.appGlobals.activity('pageview');
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

    const savedColor = localStorage.getItem('md3-yrpri-promotion-color');
    if (savedColor) {
      this.fireGlobal('yp-theme-color', savedColor);
    }

    this.boot();
  }

  async boot() {
    window.appGlobals.activity('Boot - fetch start');
    const bootResponse = (await window.serverApi.getMemory(
      currentMemoryId
    )) as CpsBootResponse;

    this.currentMemory = bootResponse.currentMemory;

    this.numberOfSolutionsGenerations =
      this.currentMemory.subProblems[0].solutions.populations.length;

    document.title = bootResponse.name;

    if (bootResponse.isAdmin === true) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    this.themeColor = bootResponse.configuration.theme_color
      ? bootResponse.configuration.theme_color
      : '#3858ca';
    this.themePrimaryColor = bootResponse.configuration.theme_primary_color;
    this.themeSecondaryColor = bootResponse.configuration.theme_secondary_color;
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

    window.appGlobals.activity('Boot - fetch end');
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
    this.addGlobalListener(
      'yp-external-goal-trigger',
      this.externalGoalTrigger.bind(this)
    );
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

  externalGoalTrigger() {
    try {
      let triggerUrl = new URL(window.appGlobals.externalGoalTriggerUrl);

      let whiteList = window.appGlobals.exernalGoalParamsWhiteList;

      if (whiteList) {
        whiteList = whiteList
          .toLowerCase()
          .split(',')
          .map((param: string) => param.trim());
      }

      for (const key in window.appGlobals.originalQueryParameters) {
        if (!whiteList || whiteList.includes(key.toLowerCase())) {
          triggerUrl.searchParams.append(
            key,
            window.appGlobals.originalQueryParameters[key]
          );
        }
      }

      window.location.href = triggerUrl.toString();
    } catch (error) {
      console.error(
        'Invalid URL:',
        window.appGlobals.externalGoalTriggerUrl,
        error
      );
    }
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

  _settingsColorChanged(event: CustomEvent) {
    this.fireGlobal('yp-theme-color', event.detail.value);
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

        .appTitle {
          margin-top: 8px;
          color: var(--md-sys-color-primary);
          font-weight: 500;
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

        md-list-item {
          --md-list-list-item-container-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          --md-list-list-item-label-text-color: var(--md-sys-color-on-surface);
        }

        .selectedContainer {
          --md-list-list-item-container-color: var(
            --md-sys-color-secondary-container
          );
          color: var(--md-sys-color-on-background);
          --md-list-list-item-label-text-color: var(
            --md-sys-color-on-background
          );
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
        }

        .mainPageContainer {
          margin-top: 16px;
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

        md-standard-icon-button {
          --md-icon-button-unselected-icon-color: #f0f0f0;
        }

        #goalTriggerSnackbar {
          padding: 24px;
        }

        @media (max-width: 960px) {
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

  updateThemeColor(event: CustomEvent) {
    this.themeColor = event.detail;
  }

  sendVoteAnalytics() {
    if (this.totalNumberOfVotes % 10 === 0) {
      window.appGlobals.activity(`User voted ${this.totalNumberOfVotes} times`);
    }
  }

  renderIntroduction() {
    return html` <div class="layout vertical center-center"></div> `;
  }

  renderShare() {
    return html` <div class="layout vertical center-center"></div> `;
  }

  toggleDarkMode() {
    this.themeDarkMode = !this.themeDarkMode;
    if (this.themeDarkMode) {
      window.appGlobals.activity('Settings - dark mode');
      localStorage.setItem('md3-aoi-dark-mode', 'true');
    } else {
      window.appGlobals.activity('Settings - light mode');
      localStorage.removeItem('md3-aoi-dark-mode');
    }
    this.themeChanged();
  }

  toggleHighContrastMode() {
    this.themeHighContrast = !this.themeHighContrast;
    if (this.themeHighContrast) {
      window.appGlobals.activity('Settings - high contrast mode');
      localStorage.setItem('md3-aoi-high-contrast-mode', 'true');
    } else {
      window.appGlobals.activity('Settings - non high contrast mode');
      localStorage.removeItem('md3-aoi-high-contrast-mode');
    }
    this.themeChanged();
  }

  startVoting() {
    this.pageIndex = 2;
    if (this.$$('#navBar') as NavigationBar) {
      (this.$$('#navBar') as NavigationBar).activeIndex = 1;
    }
  }

  openResults() {
    this.pageIndex = 3;
    if (this.$$('#navBar') as NavigationBar) {
      (this.$$('#navBar') as NavigationBar).activeIndex = 2;
    }
  }

  openAnalytics() {
    window.location.href = `/analytics`;
  }

  goToAdmin() {
    window.location.href = `/admin`;
  }

  stageModelMap = {
    createSubProblems: IEngineConstants.createSubProblemsModel,
    createEntities: IEngineConstants.createEntitiesModel,
    createSearchQueries: IEngineConstants.createSearchQueriesModel,
    rankSearchResults: IEngineConstants.searchResultsRankingsModel,
    rankSearchQueries: IEngineConstants.searchQueryRankingsModel,
    rankSubProblems: IEngineConstants.subProblemsRankingsModel,
    rankEntities: IEngineConstants.entitiesRankingsModel,
    rankSolutions: IEngineConstants.solutionsRankingsModel,
    rankProsCons: IEngineConstants.prosConsRankingsModel,
    evolveCreatePopulation: IEngineConstants.evolveSolutionsModel,
    evolveMutatePopulation: IEngineConstants.evolutionMutateModel,
    evolveRecombinePopulation: IEngineConstants.evolutionRecombineModel,
    evolveRankPopulation: IEngineConstants.solutionsRankingsModel,
    webSearch: IEngineConstants.createSearchQueriesModel, // Not sure about this mapping
    webGetPages: IEngineConstants.getPageAnalysisModel,
    createSeedSolutions: IEngineConstants.createSolutionsModel,
    createProsCons: IEngineConstants.createProsConsModel,
    parse: IEngineConstants.createSubProblemsModel, // Not sure about this mapping
    save: IEngineConstants.createSubProblemsModel, // Not sure about this mapping
    done: IEngineConstants.createSubProblemsModel, // Not sure about this mapping
  };

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
      </div>
    `;
  }

  renderCosts() {
    // Calculate total cost
    let totalCost = 0;
    let gpt4Cost = 0;
    let gpt35Cost = 0;
    let gpt35_16kCost = 0;

    try {
      Object.keys(this.currentMemory.stages).forEach(stage => {
        //@ts-ignore
        const stageData = this.currentMemory.stages[stage];
        if (stageData.tokensInCost && stageData.tokensOutCost) {
          const stageCost = stageData.tokensInCost + stageData.tokensOutCost;
          totalCost += stageCost;
          // Calculate costs for each model
          const camelCaseStage = this.toCamelCase(stage);
          //@ts-ignore
          const modelConstants = this.stageModelMap[camelCaseStage];
          if (modelConstants.name === 'gpt-4') {
            gpt4Cost += stageCost;
          } else if (modelConstants.name === 'gpt-3.5-turbo') {
            gpt35Cost += stageCost;
          } else if (modelConstants.name === 'gpt-3.5-turbo-16k') {
            gpt35_16kCost += stageCost;
          } else {
            console.error(`Unknown model name: ${modelConstants.name}`);
          }
        }
      });
    } catch (error: any) {
      console.error(error);
      debugger;
    }

    // Render total and model costs
    let costTemplates = [
      html`<div class="costItem">Total cost: $${YpFormattingHelpers.number(totalCost)}</div>`,
    ];

    // Render costs for each stage
    if (this.showAllCosts) {
      costTemplates.push(
        html`<div class="costItem" style="margin-top: 16px">
          GPT-4 cost: $${YpFormattingHelpers.number(gpt4Cost)}
        </div>`
      );
      costTemplates.push(
        html`<div class="costItem">GPT-3.5 cost: $${YpFormattingHelpers.number(gpt35Cost)}</div>`
      );
      costTemplates.push(
        html`<div class="costItem" style="margin-bottom: 16px">
          GPT-3.5 16k cost: $${YpFormattingHelpers.number(gpt35_16kCost)}
        </div>`
      );
      Object.keys(this.currentMemory.stages).forEach(stage => {
        //@ts-ignore
        const stageData = this.currentMemory.stages[stage];
        const stageCost = stageData.tokensInCost + stageData.tokensOutCost;
        if (!isNaN(stageCost)) {
          costTemplates.push(
            html`<div class="costItem">
              ${this.toCamelCase(stage)}: $${YpFormattingHelpers.number(stageCost)}
            </div>`
          );
        }
      });
    }

    if (!this.showAllCosts) {
      costTemplates.push(
        html`<div class="layout horizontal center-center">
          <a href="#" @click=${this.handleShowMore}>Show more...</a>
        </div>`
      );
    }

    return html`<div class="layout vertical">${costTemplates}</div>`;
  }

  handleShowMore(event: CustomEvent) {
    event.preventDefault();
    this.showAllCosts = true;
  }

  _renderPage() {
    if (this.currentMemory) {
      switch (this.pageIndex) {
        case PagesTypes.ProblemStatement:
          return html`<cps-problem-statement
            .memory="${this.currentMemory}"
          ></cps-problem-statement>`;
        case PagesTypes.SubProblems:
          return html`<cps-sub-problems
            .memory="${this.currentMemory}"
          ></cps-sub-problems>`;
        case PagesTypes.Entities:
          return html`<cps-entities
            .memory="${this.currentMemory}"
          ></cps-entities>`;
        case PagesTypes.Solutions:
          return html`<cps-solutions
            .memory="${this.currentMemory}"
          ></cps-solutions>`;
        default:
          return html`
            <p>Page not found try going to <a href="#main">Main</a></p>
          `;
      }
    } else {
      return html` <div class="loading">
        <md-circular-progress indeterminate></md-circular-progress>
      </div>`;
    }
  }

  renderThemeToggle() {
    return html`<div class="layout vertical center-center lightDarkContainer">
        ${!this.themeDarkMode
          ? html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>dark_mode</md-icon></md-outlined-icon-button
              >
            `
          : html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>light_mode</md-icon></md-outlined-icon-button
              >
            `}
        <div>${this.t('Light/Dark')}</div>
      </div>

      <div
        class="layout vertical center-center lightDarkContainer"
        ?hidden="${this.isAppleDevice}"
      >
        ${!this.themeHighContrast
          ? html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleHighContrastMode}"
              ><md-icon>contrast</md-icon></md-outlined-icon-button
            >
          </div> `
          : html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleHighContrastMode}"
                ><md-icon>contrast_rtl_off</md-icon></md-outlined-icon-button
              >
            `}
        <div>${this.t('Contrast')}</div>
      </div>`;
  }

  renderNavigationBar() {
    if (this.wide) {
      return html`
        <div class="drawer">
          <div class="layout horizontal headerContainer center-center">
            <div class="analyticsHeaderText layout vertical center-center">
              <yp-image
                class="collectionLogoImage"
                sizing="contain"
                src="https://yrpri-usa-production-direct-assets.s3.amazonaws.com/Robert_Bjarnason_High_quality_abstract_new_high_tech_new_wave.__61a9b3d8-7533-4841-a99e-ef036fed1fbf.png"
              ></yp-image>
              <div class="appTitle">${this.t('Collective Policy Synth')}</div>
            </div>
          </div>

          <md-list>
            <md-list-item
              class="${this.pageIndex == PagesTypes.ProblemStatement &&
              'selectedContainer'}"
              headline="${this.t('Problem Statement')}"
              @click="${() => this.changeTabTo(0)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(0);
                }
              }}"
              supportingText="${this.t(
                'The core high level problem statement'
              )}"
            >
              <md-list-item-icon slot="start">
                <md-icon>problem</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-item
              class="${this.pageIndex == PagesTypes.SubProblems &&
              'selectedContainer'}"
              headline="${this.t('Sub Problems')}"
              @click="${() => this.changeTabTo(1)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(1);
                }
              }}"
              supportingText="${this.t('Specific sub problems')}"
            >
              <md-list-item-icon slot="start">
                <md-icon>folder_open</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-item
              class="${this.pageIndex == PagesTypes.Entities &&
              'selectedContainer'}"
              headline="${this.t('Entities / Stakholders')}"
              @click="${() => this.changeTabTo(2)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(2);
                }
              }}"
              supportingText="${this.t('The affected entities / stakholders')}"
            >
              <md-list-item-icon slot="start">
                <md-icon>group</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-item
              class="${this.pageIndex == PagesTypes.Solutions &&
              'selectedContainer'}"
              headline="${this.t('Solutions')} (${this
                .numberOfSolutionsGenerations} gen)"
              @click="${() => this.changeTabTo(3)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(3);
                }
              }}"
              supportingText="${this.t('Evolving solutions to sub problems')}"
            >
              <md-list-item-icon slot="start">
                <md-icon>online_prediction</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-item
              class="${this.pageIndex == PagesTypes.PolicyCategories &&
              'selectedContainer'}"
              headline="${this.t('Policy categories')}"
              @click="${() => this.changeTabTo(4)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(4);
                }
              }}"
              supportingText="${this.t('Policy categories')}"
            >
              <md-list-item-icon slot="start">
                <md-icon>category</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-item
              class="${this.pageIndex == PagesTypes.PolicyCategories &&
              'selectedContainer'}"
              headline="${this.t('Policy ideas')} (${this
                .currentPolicyIdeasGeneration} gen)"
              @click="${() => this.changeTabTo(5)}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.changeTabTo(3);
                }
              }}"
              supportingText="${this.t('Evolving policy ideas')}"
            >
              <md-list-item-icon slot="start">
                <md-icon>policy</md-icon>
              </md-list-item-icon></md-list-item
            >
            <md-list-divider></md-list-divider>
            <md-list-item
              ?hidden="${!this.isAdmin}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.openAnalytics();
                }
              }}"
              @click="${this.openAnalytics}"
              headline="${this.t('Analytics')}"
              supportingText="${this.t('Admin analytics')}"
            >
              <md-list-item-icon slot="start"
                ><md-icon>monitoring</md-icon></md-list-item-icon
              ></md-list-item
            >
            <md-list-item
              ?hidden="${!this.isAdmin}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.goToAdmin();
                }
              }}"
              @click="${this.goToAdmin}"
              headline="${this.t('Administration')}"
              supportingText="${this.t('Administer the process')}"
            >
              <md-list-item-icon slot="start"
                ><md-icon>settings</md-icon></md-list-item-icon
              ></md-list-item
            >

            <div class="layout horizontal center-center">
              ${this.renderThemeToggle()}
            </div>
          </md-list>
          <div class="layout vertical costsContainer">
            ${this.renderStats()} ${this.renderCosts()}
          </div>
        </div>
      `;
    } else {
      return html`
        <div class="navContainer">
          <md-navigation-bar
            id="navBar"
            @navigation-bar-activated="${this.tabChanged}"
          >
            <md-navigation-tab .label="${this.t('View Memory')}"
              ><md-icon slot="activeIcon">info</md-icon>
              <md-icon slot="inactiveIcon">info</md-icon></md-navigation-tab
            >
          </md-navigation-bar>
        </div>
      `;
    }
  }

  render() {
    return html`<div class="layout horizontal">
      ${this.currentMemory ? this.renderNavigationBar() : nothing}
      <div class="rightPanel">
        <main>
          <div class="mainPageContainer">${this._renderPage()}</div>
        </main>
      </div>
    </div>

    </div>
      ${
        this.lastSnackbarText
          ? html`
              <mwc-snackbar
                id="snackbar"
                @MDCSnackbar:closed="${this.snackbarclosed}"
                style="text-align: center;"
                .labelText="${this.lastSnackbarText}"
              ></mwc-snackbar>
            `
          : nothing
      }
      `;
  }
}
