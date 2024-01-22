import { html, css, nothing, TemplateResult } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
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

import { Router } from '@lit-labs/router';

import {
  applyTheme,
  argbFromHex,
  themeFromSourceColor,
} from '@material/material-color-utilities';

import '@material/web/menu/menu.js';
import { cache } from 'lit/directives/cache.js';

import './@yrpri/common/yp-image.js';
import { YpBaseElement } from './@yrpri/common/yp-base-element.js';

//import './chat/yp-chat-assistant.js';
import { Layouts } from './flexbox-literals/classes.js';

import './policies/cps-web-research.js';

import { CpsServerApi } from './base/CpsServerApi.js';
import { CpsAppGlobals } from './base/CpsAppGlobals.js';
import { MdNavigationDrawer } from '@material/web/labs/navigationdrawer/navigation-drawer.js';
import { Snackbar } from '@material/mwc-snackbar/mwc-snackbar.js';
import { NavigationBar } from '@material/web/labs/navigationbar/internal/navigation-bar.js';
import {
  Scheme,
  applyThemeWithContrast,
  themeFromSourceColorWithContrast,
} from './@yrpri/common/YpMaterialThemeHelper.js';
import { CpsAppUser } from './base/CpsAppUser.js';

import './cps-home.js';

import './policies/cps-problem-statement.js';
import './policies/cps-sub-problems.js';
import './policies/cps-entities.js';
import './policies/cps-solutions.js';
import './policies/ps-policies.js';

import './ltp/ltp-manage-crt.js';

import { IEngineConstants } from './constants.js';
import { YpFormattingHelpers } from './@yrpri/common/YpFormattingHelpers.js';
import { CpsSolutions } from './policies/cps-solutions.js';
import { TextField } from '@material/web/textfield/internal/text-field.js';
import { Dialog } from '@material/web/dialog/internal/dialog.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/outlined-text-field.js';
import { debug } from 'console';
import { PsPolicies } from './policies/ps-policies.js';

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

@customElement('cps-app')
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
  forceGetBackupForProject: string | undefined;

  @property({ type: String })
  tempPassword: string | undefined;

  @property({ type: String })
  themeColor = '#3f5fce';

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
  numberOfPoliciesIdeasGeneration = 0;

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
    const savedDarkMode = localStorage.getItem('md3-ps-dark-mode');
    if (savedDarkMode) {
      this.themeDarkMode = true;
    } else {
      this.themeDarkMode = false;
    }

    const savedHighContrastMode = localStorage.getItem(
      'md3-ps-high-contrast-mode'
    );
    if (savedHighContrastMode) {
      this.themeHighContrast = true;
    } else {
      this.themeHighContrast = false;
    }

    window.appGlobals.activity('pageview');
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
                    <cps-solutions
                      .memory="${this.currentMemory}"
                      .activeSubProblemIndex="${this.activeSubProblemIndex}"
                      .activePopulationIndex="${this.activePopulationIndex}"
                      .activeSolutionIndex="${this.activeSolutionIndex}"
                      @update-route="${this.updateActiveSolutionIndexes}"
                      .router="${this.router}"
                    ></cps-solutions>
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

  setupCurrentProjectFromRoute(newProjectId: number, clearAll = false) {
    if (newProjectId !== this.currentProjectId) {
      this.currentProjectId = newProjectId;
      this.boot();
    }

    if (clearAll) {
      this.activeSubProblemIndex = null;
      this.activePopulationIndex = null;
      this.activeSolutionIndex = null;
      this.activePolicyIndex = null;
    }

    if (!this.wide) {
      setTimeout(() => {
        if (window.location.pathname.indexOf('webResearch') > -1) {
          if (this.$$('#navBar') as NavigationBar) {
            (this.$$('#navBar') as NavigationBar).activeIndex = 0;
          }
        } else if (window.location.pathname.indexOf('solutions') > -1) {
          if (this.$$('#navBar') as NavigationBar) {
            (this.$$('#navBar') as NavigationBar).activeIndex = 1;
          }
        } else if (window.location.pathname.indexOf('policies') > -1) {
          if (this.$$('#navBar') as NavigationBar) {
            (this.$$('#navBar') as NavigationBar).activeIndex = 2;
          }
        }
      }, 100);
    }
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

  router: Router = new Router(
    this,
    [
      {
        path: '/',
        render: () => {
          return html`<cps-home .memory="${this.currentMemory}"></cps-home>`;
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
                    <cps-web-research
                      .memory="${this.currentMemory}"
                      .router="${this.router}"
                    ></cps-web-research>
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

    const savedColor = localStorage.getItem('md3-ps-theme-color');
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
    window.appGlobals.activity('Boot - fetch start');
    const firstBootResponse = (await window.serverApi.getProject(
      this.currentProjectId,
      this.tempPassword,
      location.pathname.indexOf('refresh827cDb') > -1 ? '999' : undefined
    )) as CpsBootResponse | { needsTrm: boolean };

    if (firstBootResponse && 'needsTrm' in firstBootResponse) {
      if (this.tempPassword) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      window.appGlobals.activity('Boot - needs trm');
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
        : '#3f5fce';
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

      window.appGlobals.activity('Boot - fetch end');
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
    localStorage.setItem('md3-ps-theme-color', this.themeColor);

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
    this.addGlobalListener(
      'yp-external-goal-trigger',
      this.externalGoalTrigger.bind(this)
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

        #goalTriggerSnackbar {
          padding: 24px;
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
      localStorage.setItem('md3-ps-dark-mode', 'true');
    } else {
      window.appGlobals.activity('Settings - light mode');
      localStorage.removeItem('md3-ps-dark-mode');
    }
    this.themeChanged();
  }

  toggleHighContrastMode() {
    this.themeHighContrast = !this.themeHighContrast;
    if (this.themeHighContrast) {
      window.appGlobals.activity('Settings - high contrast mode');
      localStorage.setItem('md3-ps-high-contrast-mode', 'true');
    } else {
      window.appGlobals.activity('Settings - non high contrast mode');
      localStorage.removeItem('md3-ps-high-contrast-mode');
    }
    this.themeChanged();
  }

  setupTheme() {
    // Read dark mode and theme from localestore and set this.themeDarkMode and this.themeColor and change the theme
    const savedDarkMode = localStorage.getItem('md3-ps-dark-mode');
    if (savedDarkMode) {
      this.themeDarkMode = true;
    } else {
      this.themeDarkMode = false;
    }

    const savedHighContrastMode = localStorage.getItem(
      'md3-ps-high-contrast-mode'
    );

    if (savedHighContrastMode) {
      this.themeHighContrast = true;
    } else {
      this.themeHighContrast = false;
    }

    const savedThemeColor = localStorage.getItem('md3-ps-theme-color');
    if (savedThemeColor) {
      this.themeColor = savedThemeColor;
    }

    this.fire('yp-theme-dark-mode', this.themeDarkMode);

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
    //window.location.href = `/analytics`;
  }

  goToAdmin() {
    //window.location.href = `/admin`;
  }

  openGitHub() {
    // Open up in a new tab
    window.open('https://github.com/CitizensFoundation/policy-synth', '_blank');
  }

  stageModelMap = {
    createSubProblems: IEngineConstants.createSubProblemsModel,
    createEntities: IEngineConstants.createEntitiesModel,
    rankWebSolutions: IEngineConstants.rankWebSolutionsModel,
    analyseExternalSolutions: IEngineConstants.analyseExternalSolutionsModel,
    createSearchQueries: IEngineConstants.createSearchQueriesModel,
    createSolutionImages: IEngineConstants.createSolutionImagesModel,
    createProblemStatementImage: IEngineConstants.createSolutionImagesModel,
    createSubProblemImages: IEngineConstants.createSolutionImagesModel,
    rankSearchResults: IEngineConstants.searchResultsRankingsModel,
    policiesSeed: IEngineConstants.policiesSeedModel,
    policiesCreateImages: IEngineConstants.createSolutionImagesModel,
    rankSearchQueries: IEngineConstants.searchQueryRankingsModel,
    rankSubProblems: IEngineConstants.subProblemsRankingsModel,
    rankEntities: IEngineConstants.entitiesRankingsModel,
    rankSolutions: IEngineConstants.solutionsRankingsModel,
    rankProsCons: IEngineConstants.prosConsRankingsModel,
    evolveReapPopulation: IEngineConstants.reapSolutionsModel,
    rateSolutions: IEngineConstants.rateSolutionsModel,
    alidationAgent: IEngineConstants.validationModel,
    groupSolutions: IEngineConstants.groupSolutionsModel,
    evolveCreatePopulation: IEngineConstants.evolveSolutionsModel,
    evolveMutatePopulation: IEngineConstants.evolutionMutateModel,
    evolveRecombinePopulation: IEngineConstants.evolutionRecombineModel,
    evolveRankPopulation: IEngineConstants.solutionsRankingsModel,
    webSearch: IEngineConstants.createSearchQueriesModel, // Not sure about this mapping
    webGetPages: IEngineConstants.getPageAnalysisModel,
    webGetEvidencePages: IEngineConstants.getPageAnalysisModel,
    webGetRefinedEvidence: IEngineConstants.getRefinedEvidenceModel,
    webGetRefinedRootCauses: IEngineConstants.getRefinedRootCausesModel,
    rankWebRootCauses: IEngineConstants.rankWebRootCausesModel,
    rateWebRootCauses: IEngineConstants.rateWebRootCausesModel,
    rankWebEvidence: IEngineConstants.rankWebEvidenceModel,
    reduceSubProblems: IEngineConstants.reduceSubProblemsModel,
    createRootCausesSearchQueries: IEngineConstants.createSearchQueriesModel,
    rateWebEvidence: IEngineConstants.rateWebEvidenceModel,
    webGetRootCausesPages: IEngineConstants.getPageAnalysisModel,
    createSeedSolutions: IEngineConstants.createSolutionsModel,
    createEvidenceSearchQueries: IEngineConstants.createSearchQueriesModel,
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
        <div class="statsItem">
          ${this.t('Policies generations')}:
          ${YpFormattingHelpers.number(this.numberOfPoliciesIdeasGeneration)}
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
        if (stageData) {
          if (stageData.tokensInCost && stageData.tokensOutCost) {
            const stageCost = stageData.tokensInCost + stageData.tokensOutCost;
            totalCost += stageCost;
            // Calculate costs for each model
            const camelCaseStage = this.toCamelCase(stage);
            //console.error(`stage: ${stage} camelCaseStage: ${camelCaseStage}`)

            //@ts-ignore
            const modelConstants = this.stageModelMap[camelCaseStage];
            if (!modelConstants) {
              console.error(`Can't find stage: ${stage}`);
            } else {
              if (
                modelConstants.name === 'gpt-4' ||
                modelConstants.name === 'gpt-4-1106-preview'
              ) {
                gpt4Cost += stageCost;
              } else if (
                modelConstants.name === 'gpt-3.5-turbo' ||
                modelConstants.name === 'gpt-3.5-turbo-1106'
              ) {
                gpt35Cost += stageCost;
              } else if (modelConstants.name === 'gpt-3.5-turbo-16k') {
                gpt35_16kCost += stageCost;
              } else {
                console.error(`Unknown model name: ${modelConstants.name}`);
              }
            }
          }
        } else {
          console.warn(`No stage data for ${stage}`);
        }
      });
    } catch (error: any) {
      console.error(error.stack || error);
    }

    // Render total and model costs
    let costTemplates = [];

    // Render costs for each stage
    if (this.showAllCosts) {
      costTemplates.push(
        html`<div class="costItem">
          Total cost: $${YpFormattingHelpers.number(totalCost)}
        </div>`,
        html`<div class="costItem" style="margin-top: 16px">
          GPT-4 cost: $${YpFormattingHelpers.number(gpt4Cost)}
        </div>`
      );
      costTemplates.push(
        html`<div class="costItem">
          GPT-3.5 cost: $${YpFormattingHelpers.number(gpt35Cost)}
        </div>`
      );
      costTemplates.push(
        html`<div class="costItem" style="margin-bottom: 16px">
          GPT-3.5 16k cost: $${YpFormattingHelpers.number(gpt35_16kCost)}
        </div>`
      );
      const stageCostsArray: { stage: string; cost: any }[] = [];
      Object.keys(this.currentMemory.stages).forEach(stage => {
        //@ts-ignore
        const stageData = this.currentMemory.stages[stage];
        const stageCost = stageData.tokensInCost + stageData.tokensOutCost;
        if (!isNaN(stageCost)) {
          stageCostsArray.push({
            stage,
            cost: stageCost,
          });
        }
      });

      // Sorting the array based on stageCost
      stageCostsArray.sort((a, b) => b.cost - a.cost);

      // Pushing sorted stages to costTemplates
      stageCostsArray.forEach(item => {
        costTemplates.push(
          html`<div class="costItem">
            $${YpFormattingHelpers.number(item.cost)}-
            ${this.toCamelCase(item.stage)}
          </div>`
        );
      });
    }

    if (!this.showAllCosts) {
      costTemplates.push(
        html`<div class="layout horizontal">
          <a href="#" @click=${this.handleShowMore}>Show API cost...</a>
        </div>`
      );
    }

    return html`<div class="layout vertical">${costTemplates}</div>`;
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
    (this.$$('cps-solutions') as CpsSolutions)?.reset();
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
          <div class="layout vertical costsContainer">
            ${this.renderStats()} ${this.renderCosts()}
          </div>
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

  submitTempPassword() {
    this.tempPassword = (this.$$('#tempPassword') as TextField).value;
    (this.$$('#tempPasswordDialog') as Dialog).open = false;
    this.boot();
  }

  renderTempLoginDialog() {
    return html`<md-dialog
      id="tempPasswordDialog"
      @cancel="${(e: any) => {
        e.preventDefault();
      }}"
    >
      <div slot="headline" class="postHeader layout vertical center-center">
        ${this.t('Please Enter Password')}
      </div>
      <div id="content" slot="content" class="layout vertical center-center">
        <md-outlined-text-field
          id="tempPassword"
          type="password"
          @keyup="${(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              this.submitTempPassword();
            }
          }}"
        ></md-outlined-text-field>
        <md-elevated-button @click="${this.submitTempPassword}"
          >${this.t('Submit')}</md-elevated-button
        >
      </div>
      <div slot="footer"></div>
    </md-dialog> `;
  }

  render() {
    return html`
    ${this.renderTempLoginDialog()}
    ${this.router.outlet()}

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
