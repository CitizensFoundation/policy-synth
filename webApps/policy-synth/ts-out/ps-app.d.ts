import { TemplateResult } from 'lit';
import 'urlpattern-polyfill';
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/mwc-snackbar/mwc-snackbar.js';
import '@material/web/menu/menu.js';
import '@yrpri/webapp/common/yp-image.js';
import './policies/ps-web-research.js';
import { PsServerApi } from './base/PsServerApi.js';
import { PsAppGlobals } from './base/PsAppGlobals.js';
import { MdNavigationDrawer } from '@material/web/labs/navigationdrawer/navigation-drawer.js';
import './ps-home.js';
import './policies/ps-problem-statement.js';
import './policies/ps-sub-problems.js';
import './policies/ps-entities.js';
import './policies/ps-solutions.js';
import './policies/ps-policies.js';
import './ltp/ltp-manage-crt.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/elevated-button.js';
import '@material/web/textfield/outlined-text-field.js';
import { Scheme } from '@yrpri/webapp/common/YpMaterialThemeHelper.js';
import { PsRouter } from './base/router/router.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
declare global {
    interface Window {
        psAppGlobals: PsAppGlobals;
        psServerApi: PsServerApi;
    }
}
export declare class PolicySynthWebApp extends YpBaseElement {
    currentProjectId: number | undefined;
    activeSubProblemIndex: number | undefined;
    activePopulationIndex: number | undefined;
    activeSolutionIndex: number | undefined;
    activePolicyIndex: number | undefined;
    pageIndex: number;
    currentMemory: PsBaseMemoryData | undefined;
    totalNumberOfVotes: number;
    showAllCosts: boolean;
    lastSnackbarText: string | undefined;
    collectionType: string;
    earlName: string;
    currentError: string | undefined;
    forceGetBackupForProject: string | undefined;
    tempPassword: string | undefined;
    localStorageThemeColorKey: string;
    themeColor: string;
    themePrimaryColor: string;
    themeSecondaryColor: string;
    themeTertiaryColor: string;
    themeNeutralColor: string;
    themeScheme: Scheme;
    themeHighContrast: boolean;
    isAdmin: boolean;
    surveyClosed: boolean;
    appearanceLookup: string;
    currentLeftAnswer: string;
    currentRightAnswer: string;
    numberOfSolutionsGenerations: number;
    numberOfPoliciesIdeasGeneration: number;
    totalSolutions: number;
    totalPros: number;
    totalCons: number;
    drawer: MdNavigationDrawer;
    constructor();
    setupDebugScroll(): void;
    renderSolutionPage(): TemplateResult;
    renderPoliciesPage(): TemplateResult;
    setupCurrentProjectFromRoute(newProjectId: number, clearAll?: boolean): void;
    parseAllActiveIndexes(params: any): void;
    router: PsRouter;
    renderCrtPage(treeId?: string | undefined): TemplateResult<1>;
    renderWebResearchPage(): TemplateResult;
    getServerUrlFromClusterId(clusterId: number): "https://betrireykjavik.is/api" | "https://ypus.org/api" | "https://yrpri.org/api";
    connectedCallback(): void;
    openTempPassword(): void;
    boot(): Promise<void>;
    disconnectedCallback(): void;
    getHexColor(color: string): string;
    themeChanged(target?: HTMLElement | undefined): void;
    snackbarclosed(): void;
    tabChanged(event: CustomEvent): void;
    mobileTabChanged(event: CustomEvent): void;
    exitToMainApp(): void;
    _displaySnackbar(event: CustomEvent): Promise<void>;
    _setupEventListeners(): void;
    _removeEventListeners(): void;
    updateActiveSolutionIndexes(event: CustomEvent): Promise<void>;
    updateActivePolicyIndexes(event: CustomEvent): Promise<void>;
    updatePoliciesRouter(): Promise<void>;
    updateSolutionsRouter(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    _appError(event: CustomEvent): void;
    get adminConfirmed(): boolean;
    _settingsColorChanged(event: CustomEvent): void;
    static get styles(): import("lit").CSSResult[];
    changeTabTo(tabId: number): void;
    updateThemeColor(event: CustomEvent): void;
    sendVoteAnalytics(): void;
    renderIntroduction(): TemplateResult<1>;
    renderShare(): TemplateResult<1>;
    toggleDarkMode(): void;
    toggleHighContrastMode(): void;
    setupTheme(): void;
    startVoting(): void;
    openResults(): void;
    openAnalytics(): void;
    goToAdmin(): void;
    openGitHub(): void;
    stageModelMap: {
        createSubProblems: IEngineBaseAIModelConstants;
        createEntities: IEngineBaseAIModelConstants;
        rankWebSolutions: IEngineBaseAIModelConstants;
        analyseExternalSolutions: IEngineBaseAIModelConstants;
        createSearchQueries: IEngineBaseAIModelConstants;
        createSolutionImages: IEngineBaseAIModelConstants;
        createProblemStatementImage: IEngineBaseAIModelConstants;
        createSubProblemImages: IEngineBaseAIModelConstants;
        rankSearchResults: IEngineBaseAIModelConstants;
        policiesSeed: IEngineBaseAIModelConstants;
        policiesCreateImages: IEngineBaseAIModelConstants;
        rankSearchQueries: IEngineBaseAIModelConstants;
        rankSubProblems: IEngineBaseAIModelConstants;
        rankEntities: IEngineBaseAIModelConstants;
        rankSolutions: IEngineBaseAIModelConstants;
        rankProsCons: IEngineBaseAIModelConstants;
        evolveReapPopulation: IEngineBaseAIModelConstants;
        rateSolutions: IEngineBaseAIModelConstants;
        alidationAgent: IEngineBaseAIModelConstants;
        groupSolutions: IEngineBaseAIModelConstants;
        evolveCreatePopulation: IEngineBaseAIModelConstants;
        evolveMutatePopulation: IEngineBaseAIModelConstants;
        evolveRecombinePopulation: IEngineBaseAIModelConstants;
        evolveRankPopulation: IEngineBaseAIModelConstants;
        webSearch: IEngineBaseAIModelConstants;
        webGetPages: IEngineBaseAIModelConstants;
        webGetEvidencePages: IEngineBaseAIModelConstants;
        webGetRefinedEvidence: IEngineBaseAIModelConstants;
        webGetRefinedRootCauses: IEngineBaseAIModelConstants;
        rankWebRootCauses: IEngineBaseAIModelConstants;
        rateWebRootCauses: IEngineBaseAIModelConstants;
        rankWebEvidence: IEngineBaseAIModelConstants;
        reduceSubProblems: IEngineBaseAIModelConstants;
        createRootCausesSearchQueries: IEngineBaseAIModelConstants;
        rateWebEvidence: IEngineBaseAIModelConstants;
        webGetRootCausesPages: IEngineBaseAIModelConstants;
        createSeedSolutions: IEngineBaseAIModelConstants;
        createEvidenceSearchQueries: IEngineBaseAIModelConstants;
        createProsCons: IEngineBaseAIModelConstants;
        parse: IEngineBaseAIModelConstants;
        save: IEngineBaseAIModelConstants;
        done: IEngineBaseAIModelConstants;
    };
    toCamelCase(str: string): string;
    renderStats(): TemplateResult<1>;
    renderCosts(): TemplateResult<1>;
    renderContentOrLoader(content: TemplateResult): TemplateResult;
    handleShowMore(event: CustomEvent): void;
    getCustomVersion(version: string): string;
    renderThemeToggle(hideText?: boolean): TemplateResult<1>;
    renderLogo(): TemplateResult<1>;
    openSolutions(): Promise<void>;
    openPolicies(): Promise<void>;
    openWebResearch(): Promise<void>;
    renderNavigationBar(): TemplateResult<1>;
    submitTempPassword(): void;
    renderTempLoginDialog(): TemplateResult<1>;
    render(): TemplateResult<1>;
}
//# sourceMappingURL=ps-app.d.ts.map