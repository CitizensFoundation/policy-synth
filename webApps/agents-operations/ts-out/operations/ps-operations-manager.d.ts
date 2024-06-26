import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/button/filled-button.js';
import './ps-operations-view.js';
import './OpsServerApi.js';
import { OpsServerApi } from './OpsServerApi.js';
import './chat/agent-chat-assistant.js';
import { OpsStreamingAIResponse } from './OpsStreamingAIResponse.js';
import { PsOperationsView } from './ps-operations-view.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
import { PsBaseWithRunningAgentObserver } from '../base/PsBaseWithRunningAgent.js';
export declare class PsOperationsManager extends PsBaseWithRunningAgentObserver {
    currentAgentId: number | undefined;
    currentAgent: PsAgentAttributes | undefined;
    isFetchingAgent: boolean;
    nodeToEditInfo: PsAgentAttributes | PsAgentConnectorAttributes | undefined;
    nodeToEdit: PsOperationsBaseNode | undefined;
    allCausesExceptCurrentToEdit: PsOperationsBaseNode[];
    showDeleteConfirmation: boolean;
    activeTabIndex: number;
    currentlySelectedCauseIdToAddAsChild: string | undefined;
    AIConfigReview: string | undefined;
    isReviewingAgent: boolean;
    isCreatingAgent: boolean;
    agentElement: PsOperationsView;
    api: OpsServerApi;
    nodeToAddCauseTo: PsOperationsBaseNode | undefined;
    wsMessageListener: ((event: any) => void) | undefined;
    currentStreaminReponse: OpsStreamingAIResponse | undefined;
    constructor();
    getAgent(): Promise<void>;
    setupTestData(): void;
    connectedCallback(): Promise<void>;
    openEditNodeDialog(event: CustomEvent): void;
    saveAnswers(): void;
    closeEditNodeDialog(): void;
    addChildChanged(): void;
    handleSaveEditNode(): Promise<void>;
    handleDeleteNode(): void;
    removeNodeRecursively(nodes: PsOperationsBaseNode[], nodeId: string): void;
    confirmDeleteNode(): Promise<void>;
    createDirectCauses(): void;
    closeDeleteConfirmationDialog(): void;
    renderDeleteConfirmationDialog(): import("lit").TemplateResult<1>;
    _saveNodeEditState(event: CustomEvent): void;
    renderNodeEditHeadline(): import("lit").TemplateResult<1>;
    renderEditNodeDialog(): import("lit").TemplateResult<1>;
    updatePath(): void;
    fetchCurrentAgent(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    camelCaseToHumanReadable(str: string): string;
    static get styles(): any[];
    tabChanged(): void;
    clearForNew(): void;
    get agentInputData(): any;
    reviewAgentConfiguration(): Promise<void>;
    createAgent(): Promise<void>;
    toggleDarkMode(): void;
    randomizeTheme(): void;
    renderAIConfigReview(): import("lit").TemplateResult<1>;
    renderReviewAndSubmit(): import("lit").TemplateResult<1>;
    renderThemeToggle(): import("lit").TemplateResult<1>;
    renderConfiguration(): import("lit").TemplateResult<1>;
    openAddCauseDialog(event: CustomEvent): void;
    closeAddCauseDialog(): void;
    renderAddCauseDialog(): import("lit").TemplateResult<1>;
    render(): any;
}
//# sourceMappingURL=ps-operations-manager.d.ts.map