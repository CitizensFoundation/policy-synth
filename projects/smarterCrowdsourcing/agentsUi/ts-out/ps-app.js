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
import './policies/ps-problem-statement.js';
import './policies/ps-sub-problems.js';
import './policies/ps-entities.js';
import './policies/ps-solutions.js';
import './policies/ps-policies.js';
import './ltp/ltp-manage-crt.js';
import { PsConstants } from './constants.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/outlined-text-field.js';
import { applyThemeWithContrast, themeFromSourceColorWithContrast, } from '@yrpri/webapp/common/YpMaterialThemeHelper.js';
import { PsRouter } from './base/router/router.js';
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
let PolicySynthWebApp = class PolicySynthWebApp extends YpBaseElement {
    constructor() {
        super();
        this.currentProjectId = undefined;
        this.pageIndex = PagesTypes.Solutions;
        this.totalNumberOfVotes = 0;
        this.showAllCosts = false;
        this.collectionType = 'domain';
        this.localStorageThemeColorKey = 'md3-ps-theme-color-v2';
        this.themeColor = '#df2302';
        this.themePrimaryColor = '#000000';
        this.themeSecondaryColor = '#000000';
        this.themeTertiaryColor = '#000000';
        this.themeNeutralColor = '#000000';
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
            // Next two are depricated
            {
                path: '/projects/:projectId',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/projects/:projectId/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/solutions/:projectId',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/solutions/:projectId/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
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
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderPoliciesPage();
                },
            },
            {
                path: '/policies/:projectId/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderPoliciesPage();
                },
            },
            {
                path: '/projects/:projectId/refresh827cDb',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1, true);
                    return this.renderSolutionPage();
                },
            },
            // Next two are depricated but kept of backwards compatibility
            {
                path: '/projects/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/projects/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/solutions/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/solutions/:projectId/:subProblemIndex?/:populationIndex?/:solutionIndex?/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderSolutionPage();
                },
            },
            {
                path: '/policies/:projectId/:subProblemIndex?/:populationIndex?/:policyIndex?',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderPoliciesPage();
                },
            },
            {
                path: '/policies/:projectId/:subProblemIndex?/:populationIndex?/:policyIndex?/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    this.parseAllActiveIndexes(params);
                    return this.renderPoliciesPage();
                },
            },
            {
                path: '/webResearch/:projectId',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    return this.renderWebResearchPage();
                },
            },
            {
                path: '/webResearch/:projectId/',
                render: params => {
                    this.setupCurrentProjectFromRoute(parseInt(params.projectId, 10) || 1);
                    return this.renderWebResearchPage();
                },
            },
        ], {
            fallback: {
                render: () => html `<h2>Page not found</h2>`,
            },
        });
        this.stageModelMap = {
            createSubProblems: PsConstants.createSubProblemsModel,
            createEntities: PsConstants.createEntitiesModel,
            rankWebSolutions: PsConstants.rankWebSolutionsModel,
            analyseExternalSolutions: PsConstants.analyseExternalSolutionsModel,
            createSearchQueries: PsConstants.createSearchQueriesModel,
            createSolutionImages: PsConstants.createSolutionImagesModel,
            createProblemStatementImage: PsConstants.createSolutionImagesModel,
            createSubProblemImages: PsConstants.createSolutionImagesModel,
            rankSearchResults: PsConstants.searchResultsRankingsModel,
            policiesSeed: PsConstants.policiesSeedModel,
            policiesCreateImages: PsConstants.createSolutionImagesModel,
            rankSearchQueries: PsConstants.searchQueryRankingsModel,
            rankSubProblems: PsConstants.subProblemsRankingsModel,
            rankEntities: PsConstants.entitiesRankingsModel,
            rankSolutions: PsConstants.solutionsRankingsModel,
            rankProsCons: PsConstants.prosConsRankingsModel,
            evolveReapPopulation: PsConstants.reapSolutionsModel,
            rateSolutions: PsConstants.rateSolutionsModel,
            alidationAgent: PsConstants.validationModel,
            groupSolutions: PsConstants.groupSolutionsModel,
            evolveCreatePopulation: PsConstants.evolveSolutionsModel,
            evolveMutatePopulation: PsConstants.evolutionMutateModel,
            evolveRecombinePopulation: PsConstants.evolutionRecombineModel,
            evolveRankPopulation: PsConstants.solutionsRankingsModel,
            webSearch: PsConstants.createSearchQueriesModel, // Not sure about this mapping
            webGetPages: PsConstants.getPageAnalysisModel,
            webGetEvidencePages: PsConstants.getPageAnalysisModel,
            webGetRefinedEvidence: PsConstants.getRefinedEvidenceModel,
            webGetRefinedRootCauses: PsConstants.getRefinedRootCausesModel,
            rankWebRootCauses: PsConstants.rankWebRootCausesModel,
            rateWebRootCauses: PsConstants.rateWebRootCausesModel,
            rankWebEvidence: PsConstants.rankWebEvidenceModel,
            reduceSubProblems: PsConstants.reduceSubProblemsModel,
            createRootCausesSearchQueries: PsConstants.createSearchQueriesModel,
            rateWebEvidence: PsConstants.rateWebEvidenceModel,
            webGetRootCausesPages: PsConstants.getPageAnalysisModel,
            createSeedSolutions: PsConstants.createSolutionsModel,
            createEvidenceSearchQueries: PsConstants.createSearchQueriesModel,
            createProsCons: PsConstants.createProsConsModel,
            parse: PsConstants.createSubProblemsModel, // Not sure about this mapping
            save: PsConstants.createSubProblemsModel, // Not sure about this mapping
            done: PsConstants.createSubProblemsModel, // Not sure about this mapping
        };
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
        window.addEventListener('keydown', (event) => {
            if (event.key === 's' && !isScrolling) {
                startScrolling();
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.key === 's') {
                stopScrolling();
            }
        });
    }
    renderSolutionPage() {
        return this.renderContentOrLoader(html `
      <div class="layout horizontal">
        ${this.currentMemory
            ? html `
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
        return this.renderContentOrLoader(html `
      <div class="layout horizontal">
        ${this.currentMemory
            ? html `
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
    setupCurrentProjectFromRoute(newProjectId, clearAll = false) {
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
                    if (this.$$('#navBar')) {
                        this.$$('#navBar').activeIndex = 0;
                    }
                }
                else if (window.location.pathname.indexOf('solutions') > -1) {
                    if (this.$$('#navBar')) {
                        this.$$('#navBar').activeIndex = 1;
                    }
                }
                else if (window.location.pathname.indexOf('policies') > -1) {
                    if (this.$$('#navBar')) {
                        this.$$('#navBar').activeIndex = 2;
                    }
                }
            }, 100);
        }
    }
    parseAllActiveIndexes(params) {
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
    renderCrtPage(treeId = undefined) {
        return html `
      <ltp-manage-crt
        .currentTreeId="${treeId}"
        .themeDarkMode="${this.themeDarkMode}"
        ="${treeId}"
      ></ltp-manage-crt>
    `;
    }
    renderWebResearchPage() {
        return this.renderContentOrLoader(html `
      <div class="layout horizontal">
        ${this.currentMemory
            ? html `
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
    openTempPassword() {
        this.tempPassword = undefined;
        this.$$('#tempPassword').value = '';
        this.$$('#tempPasswordDialog').open = true;
    }
    async boot() {
        window.psAppGlobals.activity('Boot - fetch start');
        const firstBootResponse = (await window.psServerApi.getProject(this.currentProjectId, this.tempPassword, location.pathname.indexOf('refresh827cDb') > -1 ? '999' : undefined));
        if (firstBootResponse && 'needsTrm' in firstBootResponse) {
            if (this.tempPassword) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            window.psAppGlobals.activity('Boot - needs trm');
            this.openTempPassword();
        }
        else {
            const bootResponse = firstBootResponse;
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
                themeCss = themeFromSourceColorWithContrast(this.getHexColor(this.themeColor), isDark, this.themeScheme, this.themeHighContrast ? 2.0 : 0.0);
            }
            else {
                themeCss = themeFromSourceColorWithContrast({
                    primary: this.getHexColor(this.themePrimaryColor || '#000000'),
                    secondary: this.getHexColor(this.themeSecondaryColor || '#000000'),
                    tertiary: this.getHexColor(this.themeTertiaryColor || '#000000'),
                    neutral: this.getHexColor(this.themeNeutralColor || '#000000'),
                }, isDark, 'dynamic', this.themeHighContrast ? 2.0 : 0.0);
            }
            applyThemeWithContrast(document, themeCss);
        }
    }
    snackbarclosed() {
        this.lastSnackbarText = undefined;
    }
    tabChanged(event) {
        if (event.detail.activeIndex == 0) {
            this.pageIndex = 1;
        }
        else if (event.detail.activeIndex == 1) {
            this.pageIndex = 2;
        }
        else if (event.detail.activeIndex == 2) {
            this.pageIndex = 3;
        }
        else if (event.detail.activeIndex == 3) {
            this.pageIndex = 4;
        }
    }
    mobileTabChanged(event) {
        if (event.detail.activeIndex == 3) {
            event.target.activeIndex = 1;
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
    async _displaySnackbar(event) {
        this.lastSnackbarText = event.detail;
        await this.updateComplete;
        this.$$('#snackbar').show();
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
    async updateActiveSolutionIndexes(event) {
        this.activeSubProblemIndex = event.detail.activeSubProblemIndex;
        this.activePopulationIndex = event.detail.activePopulationIndex;
        this.activeSolutionIndex = event.detail.activeSolutionIndex;
        await this.updateSolutionsRouter();
        /*console.error(
          `updateActiveSolutionIndexes ${this.activeSubProblemIndex} ${this.activePopulationIndex} ${this.activeSolutionIndex}`
        )*/
    }
    async updateActivePolicyIndexes(event) {
        this.activeSubProblemIndex = event.detail.activeSubProblemIndex;
        this.activePopulationIndex = event.detail.activePopulationIndex;
        this.activePolicyIndex = event.detail.activePolicyIndex;
        await this.updatePoliciesRouter();
    }
    async updatePoliciesRouter() {
        let path;
        if (this.activePolicyIndex !== null &&
            this.activeSubProblemIndex !== null &&
            this.activePopulationIndex !== null) {
            path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activePolicyIndex}`;
        }
        else if (this.activeSubProblemIndex !== null &&
            this.activePopulationIndex !== null) {
            path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}`;
        }
        else if (this.activeSubProblemIndex !== null &&
            this.activeSubProblemIndex !== undefined) {
            path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}`;
        }
        else {
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
        let path;
        if (this.activePolicyIndex !== null &&
            this.activeSubProblemIndex !== null &&
            this.activePopulationIndex !== null) {
            path = `/policies/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activePolicyIndex}`;
        }
        else if (this.activeSolutionIndex !== null &&
            this.activeSubProblemIndex !== null &&
            this.activePopulationIndex !== null) {
            path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}/${this.activeSolutionIndex}`;
        }
        else if (this.activeSubProblemIndex !== null &&
            this.activePopulationIndex !== null) {
            path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}/${this.activePopulationIndex}`;
        }
        else if (this.activeSubProblemIndex !== null &&
            this.activeSubProblemIndex !== undefined) {
            path = `/solutions/${this.currentProjectId}/${this.activeSubProblemIndex}`;
        }
        else {
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
    changeTabTo(tabId) {
        this.tabChanged({ detail: { activeIndex: tabId } });
    }
    updateThemeColor(event) {
        this.themeColor = event.detail;
    }
    sendVoteAnalytics() {
        if (this.totalNumberOfVotes % 10 === 0) {
            window.psAppGlobals.activity(`User voted ${this.totalNumberOfVotes} times`);
        }
    }
    renderIntroduction() {
        return html ` <div class="layout vertical center-center"></div> `;
    }
    renderShare() {
        return html ` <div class="layout vertical center-center"></div> `;
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
    startVoting() {
        this.pageIndex = 2;
        if (this.$$('#navBar')) {
            this.$$('#navBar').activeIndex = 1;
        }
    }
    openResults() {
        this.pageIndex = 3;
        if (this.$$('#navBar')) {
            this.$$('#navBar').activeIndex = 2;
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
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    }
    renderStats() {
        return html `
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
                        }
                        else {
                            if (modelConstants.name === 'gpt-4' ||
                                modelConstants.name === 'gpt-4-1106-preview') {
                                gpt4Cost += stageCost;
                            }
                            else if (modelConstants.name === 'gpt-3.5-turbo' ||
                                modelConstants.name === 'gpt-3.5-turbo-1106') {
                                gpt35Cost += stageCost;
                            }
                            else if (modelConstants.name === 'gpt-3.5-turbo-16k') {
                                gpt35_16kCost += stageCost;
                            }
                            else {
                                console.error(`Unknown model name: ${modelConstants.name}`);
                            }
                        }
                    }
                }
                else {
                    console.warn(`No stage data for ${stage}`);
                }
            });
        }
        catch (error) {
            console.error(error.stack || error);
        }
        // Render total and model costs
        let costTemplates = [];
        // Render costs for each stage
        if (this.showAllCosts) {
            costTemplates.push(html `<div class="costItem">
          Total cost: $${YpFormattingHelpers.number(totalCost)}
        </div>`, html `<div class="costItem" style="margin-top: 16px">
          GPT-4 cost: $${YpFormattingHelpers.number(gpt4Cost)}
        </div>`);
            costTemplates.push(html `<div class="costItem">
          GPT-3.5 cost: $${YpFormattingHelpers.number(gpt35Cost)}
        </div>`);
            costTemplates.push(html `<div class="costItem" style="margin-bottom: 16px">
          GPT-3.5 16k cost: $${YpFormattingHelpers.number(gpt35_16kCost)}
        </div>`);
            const stageCostsArray = [];
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
                costTemplates.push(html `<div class="costItem">
            $${YpFormattingHelpers.number(item.cost)}-
            ${this.toCamelCase(item.stage)}
          </div>`);
            });
        }
        if (!this.showAllCosts) {
            costTemplates.push(html `<div class="layout horizontal">
          <a href="#" @click=${this.handleShowMore}>Show API cost...</a>
        </div>`);
        }
        return html `<div class="layout vertical">${costTemplates}</div>`;
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
    getCustomVersion(version) {
        const date = new Date();
        const formattedDate = date.toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        return `Built on ${formattedDate} CET`;
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
    renderLogo() {
        return html `
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
        this.$$('ps-solutions')?.reset();
    }
    async openPolicies() {
        this.activePolicyIndex = null;
        this.activeSolutionIndex = null;
        this.activeSubProblemIndex = null;
        this.activePopulationIndex = null;
        this.updatePoliciesRouter();
        await this.updateComplete;
        this.$$('ps-policies')?.reset();
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
            return html `
        <div class="drawer">
          <div class="layout horizontal headerContainer center-center">
            <div class="analyticsHeaderText layout vertical center-center">
              ${this.renderLogo()}
            </div>
          </div>

          <md-list>
            <md-list-item
              type="button"
              class="${location.href.indexOf('/webResearch') > -1 &&
                'selectedContainer'}"

              @click="${() => this.openWebResearch()}"
              @keydown="${(e) => {
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
              class="${location.href.indexOf('/solutions') > -1 && 'selectedContainer'}"

              @click="${async () => {
                this.openSolutions();
                setTimeout(() => {
                    this.requestUpdate();
                });
            }}"
              @keydown="${(e) => {
                if (e.key === 'Enter') {
                    this.openSolutions();
                }
            }}"
            >
              <div slot="headline">${this.t('Solutions')}</div>
              <div slot="supporting-text">${this.numberOfSolutionsGenerations} generations</div>
              <md-icon slot="start">online_prediction</md-icon>
            </md-list-item>
            <md-list-item hidden
              type="button"
              class="${this.pageIndex == PagesTypes.PolicyCategories &&
                'selectedContainer'}"
            >
              <div slot="headline">${this.t('Policy categories')}</div>
              <div slot="supporting-text">${this.t('Policy categories')}</div>
              <md-icon slot="start">category</md-icon>
            </md-list-item>

            <md-list-item
              type="button"
              class="${this.pageIndex == PagesTypes.PolicyCategories &&
                'selectedContainer'}"

              @click="${async () => {
                this.openPolicies();
                setTimeout(() => {
                    this.requestUpdate();
                });
            }}"
              @keydown="${(e) => {
                if (e.key === 'Enter') {
                    this.openPolicies();
                }
            }}"
            >
              <div slot="headline">${this.t('Policy ideas')}</div>
              <div slot="supporting-text">${this.numberOfPoliciesIdeasGeneration} generations</div>
              <md-icon slot="start">policy</md-icon>
            </md-list-item>

            <md-list-divider></md-list-divider>
            <md-list-item
              type="button"
              ?hidden="${true /*!this.isAdmin*/}"
              @keydown="${(e) => {
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
              @keydown="${(e) => {
                if (e.key === 'Enter') {
                    this.goToAdmin();
                }
            }}"
              @click="${this.goToAdmin}"
            >
              <div slot="headline">${this.t('Administration')}</div>
              <div slot="supporting-text">${this.t('Administer the process')}</div>
              <md-icon slot="start">settings</md-icon>
            </md-list-item>
            <md-list-divider></md-list-divider>
            <md-list-item
              type="button"
              @keydown="${(e) => {
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
        }
        else {
            return html `
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
        this.tempPassword = this.$$('#tempPassword').value;
        this.$$('#tempPasswordDialog').open = false;
        this.boot();
    }
    renderTempLoginDialog() {
        return html `<md-dialog
      id="tempPasswordDialog"
      @cancel="${(e) => {
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
          @keyup="${(e) => {
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
        return html `
    ${this.renderTempLoginDialog()}
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
], PolicySynthWebApp.prototype, "currentProjectId", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "activeSubProblemIndex", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "activePopulationIndex", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "activeSolutionIndex", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "activePolicyIndex", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "pageIndex", void 0);
__decorate([
    property({ type: Object })
], PolicySynthWebApp.prototype, "currentMemory", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "totalNumberOfVotes", void 0);
__decorate([
    property({ type: Boolean })
], PolicySynthWebApp.prototype, "showAllCosts", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "lastSnackbarText", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "collectionType", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "earlName", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "currentError", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "forceGetBackupForProject", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "tempPassword", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "localStorageThemeColorKey", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themeColor", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themePrimaryColor", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themeSecondaryColor", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themeTertiaryColor", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themeNeutralColor", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "themeScheme", void 0);
__decorate([
    property({ type: Boolean })
], PolicySynthWebApp.prototype, "themeHighContrast", void 0);
__decorate([
    property({ type: Boolean })
], PolicySynthWebApp.prototype, "isAdmin", void 0);
__decorate([
    property({ type: Boolean })
], PolicySynthWebApp.prototype, "surveyClosed", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "appearanceLookup", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "currentLeftAnswer", void 0);
__decorate([
    property({ type: String })
], PolicySynthWebApp.prototype, "currentRightAnswer", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "numberOfSolutionsGenerations", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "numberOfPoliciesIdeasGeneration", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "totalSolutions", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "totalPros", void 0);
__decorate([
    property({ type: Number })
], PolicySynthWebApp.prototype, "totalCons", void 0);
PolicySynthWebApp = __decorate([
    customElement('ps-app')
], PolicySynthWebApp);
export { PolicySynthWebApp };
//# sourceMappingURL=ps-app.js.map