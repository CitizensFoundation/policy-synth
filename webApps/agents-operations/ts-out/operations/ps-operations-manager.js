var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { resolveMarkdown } from '../chatBot/litMarkdown.js';
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
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { PsBaseWithRunningAgentObserver } from '../base/PsBaseWithRunningAgent.js';
const TESTING = false;
const nodeTypes = ['agent', 'connector'];
let PsOperationsManager = class PsOperationsManager extends PsBaseWithRunningAgentObserver {
    constructor() {
        super();
        this.currentAgentId = 1;
        this.isFetchingAgent = false;
        this.allCausesExceptCurrentToEdit = [];
        this.showDeleteConfirmation = false;
        this.activeTabIndex = 0;
        this.isReviewingAgent = false;
        this.isCreatingAgent = false;
        this.wsMessageListener = undefined;
        this.api = new OpsServerApi();
        //this.setupTestData();
        this.getAgent();
    }
    async getAgent() {
        this.isFetchingAgent = true;
        try {
            const agent = await this.api.getAgent(this.currentAgentId);
            this.currentAgent = agent;
        }
        catch (error) {
            console.error('Error fetching agent:', error);
        }
        finally {
            this.isFetchingAgent = false;
        }
    }
    async connectedCallback() {
        super.connectedCallback();
        this.addEventListener('open-add-cause-dialog', this.openAddCauseDialog);
        this.addEventListener('close-add-cause-dialog', this.closeAddCauseDialog);
        if (this.currentAgentId) {
            this.fetchCurrentAgent();
        }
        this.addEventListener('edit-node', this.openEditNodeDialog);
        //TODO: Remove listeners
        this.addEventListener('get-costs', this.fetchAgentCosts);
    }
    async fetchAgentCosts() {
        if (this.currentAgentId) {
            try {
                this.totalCosts = await this.api.getAgentCosts(this.currentAgentId);
            }
            catch (error) {
                console.error('Error fetching agent costs:', error);
            }
        }
    }
    openEditNodeDialog(event) {
        this.nodeToEditInfo = event.detail.element;
        this.currentlySelectedCauseIdToAddAsChild = undefined;
        /*this.nodeToEdit = this.findNodeRecursively(
          this.currentAgent?.SubAgents || [],
          this.nodeToEditInfo!.nodeId
        );
        if (!this.nodeToEdit) {
          console.error(`Could not find node ${this.nodeToEditInfo!.nodeId}`);
          console.error(JSON.stringify(this.currentAgent, null, 2));
          return;
        }
    
        const childrenIds = (this.nodeToEdit.children || []).map(
          (child) => child.id
        );
        childrenIds.push(this.nodeToEdit.id);
    
        this.allCausesExceptCurrentToEdit =
          this.agentElement!.getAllCausesExcept(childrenIds);*/
        this.$$('#editNodeDialog').show();
    }
    saveAnswers() {
        for (let a = 0; a < this.nodeToEditInfo.Class.configuration.questions.length; a++) {
            const questionElement = this.$$('#structuredQuestion_' + a);
            if (questionElement) {
                const answer = questionElement.getAnswer();
                //TODO: See if we can solve the below without any without adding much complexity
                if (answer && questionElement.question.uniqueId) {
                    this.nodeToEditInfo.configuration[questionElement.question.uniqueId] = answer.value;
                }
            }
        }
    }
    closeEditNodeDialog() {
        this.$$('#editNodeDialog').close();
        this.nodeToEdit = undefined;
        this.nodeToEditInfo = undefined;
    }
    addChildChanged() {
        const effectIdSelect = this.$$('#addEffectToNodeId');
        this.currentlySelectedCauseIdToAddAsChild = effectIdSelect.value;
    }
    async handleSaveEditNode() {
        this.saveAnswers();
        if (this.currentAgentId && this.nodeToEditInfo) {
            try {
                // Only send the updated configuration
                const updatedConfig = this.nodeToEditInfo.configuration;
                // Determine if it's an agent or a connector
                const nodeType = this.nodeToEditInfo.Class.name.indexOf('Agent') > -1
                    ? 'agent'
                    : 'connector';
                // Send the updated configuration to the server
                await this.api.updateNodeConfiguration(this.currentAgentId, this.nodeToEditInfo.id, nodeType, updatedConfig);
                // Update the local state
                if (this.currentAgent) {
                    // Find the node in the current agent structure and update its configuration
                    this.updateNodeConfigurationInAgent(this.currentAgent, this.nodeToEditInfo.id, updatedConfig);
                }
                this.closeEditNodeDialog();
                this.requestUpdate();
            }
            catch (error) {
                console.error('Error updating node configuration:', error);
            }
        }
    }
    updateNodeConfigurationInAgent(agent, nodeId, newConfig) {
        if (agent.id === nodeId) {
            agent.configuration = newConfig;
        }
        else if (agent.SubAgents) {
            for (let subAgent of agent.SubAgents) {
                this.updateNodeConfigurationInAgent(subAgent, nodeId, newConfig);
            }
        }
        if (agent.Connectors) {
            for (let connector of agent.Connectors) {
                if (connector.id === nodeId) {
                    connector.configuration = newConfig;
                }
            }
        }
    }
    handleDeleteNode() {
        this.showDeleteConfirmation = true;
    }
    removeNodeRecursively(nodes, nodeId) {
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            nodes.splice(index, 1);
            return;
        }
        nodes.forEach(node => {
            if (node.children) {
                //this.removeNodeRecursively(node.SubAgents, nodeId);
            }
        });
    }
    async confirmDeleteNode() {
        if (this.nodeToEdit && this.currentAgentId) {
            try {
                await this.api.deleteNode(this.currentAgentId, this.nodeToEdit.id);
                // Remove the node from the agent object
                // this.removeNodeRecursively(this.currentAgent?.SubAgents || [], this.nodeToEdit.id);
                this.closeEditNodeDialog();
                this.currentAgent = { ...this.currentAgent };
            }
            catch (error) {
                console.error('Error deleting node:', error);
            }
            finally {
                this.closeDeleteConfirmationDialog();
            }
        }
    }
    createDirectCauses() {
        if (this.nodeToEditInfo) {
            //this.nodeToEditInfo.element.createDirectCauses();
        }
        this.closeEditNodeDialog();
    }
    closeDeleteConfirmationDialog() {
        this.showDeleteConfirmation = false;
    }
    renderDeleteConfirmationDialog() {
        return html `
      <md-dialog
        id="deleteConfirmationDialog"
        ?open="${this.showDeleteConfirmation}"
        @closed="${() => (this.showDeleteConfirmation = false)}"
      >
        <div slot="headline">Confirm Deletion</div>
        <div slot="content">Are you sure you want to delete this node?</div>
        <div slot="actions">
          <md-text-button @click="${this.closeDeleteConfirmationDialog}">
            Cancel
          </md-text-button>
          <md-text-button @click="${this.confirmDeleteNode}">
            Delete
          </md-text-button>
        </div>
      </md-dialog>
    `;
    }
    _saveNodeEditState(event) { }
    renderNodeEditHeadline() {
        return html `
      <div class="layout horizontal">
        <div>
          <img
            src="${this.nodeToEditInfo.Class.configuration.imageUrl}"
            class="nodeEditHeadlineImage"
          />
        </div>
        <div class="nodeEditHeadlineTitle">
          ${this.nodeToEditInfo.Class.name}
        </div>
      </div>
    `;
    }
    renderEditNodeDialog() {
        let initiallyLoadedAnswers = [];
        if (this.nodeToEditInfo) {
            // Convert this.nodeToEditInfo.configuration object to array with { "uniqueId": key, "value": value }
            initiallyLoadedAnswers = Object.entries(this.nodeToEditInfo.configuration).map(([key, value]) => ({
                uniqueId: key,
                value: value,
            }));
        }
        return html `
      <md-dialog
        id="editNodeDialog"
        style="width: 800px; max-height:100%;height:100%;"
        @closed="${this.closeEditNodeDialog}"
      >
        <div slot="headline">
          ${this.nodeToEditInfo ? this.renderNodeEditHeadline() : ''}
        </div>
        <div
          slot="content"
          id="editNodeForm"
          style="max-height: 90vh;height: 100%;"
          class="layout vertical"
        >
          ${this.nodeToEditInfo
            ? html `
                <div id="surveyContainer">
                  ${this.nodeToEditInfo.Class.configuration.questions.map((question, index) => html `
                      <yp-structured-question-edit
                        index="${index}"
                        id="structuredQuestion_${question.uniqueId
                ? index
                : `noId_${index}`}"
                        .structuredAnswers="${initiallyLoadedAnswers}"
                        @changed="${this._saveNodeEditState}"
                        .question="${question}"
                      >
                      </yp-structured-question-edit>
                    `)}
                </div>
              `
            : nothing}
        </div>
        <div slot="actions">
          <md-text-button
            hidden
            @click="${this.handleDeleteNode}"
            class="deleteButton"
          >
            Delete
          </md-text-button>
          <div class="flex"></div>
          <md-text-button @click="${this.closeEditNodeDialog}" value="cancel">
            Cancel
          </md-text-button>
          <md-text-button @click="${this.handleSaveEditNode}" value="ok">
            Save
          </md-text-button>
        </div>
      </md-dialog>
    `;
    }
    updatePath() {
        const dontDoIt = false;
        if (!dontDoIt) {
            if (this.currentAgent && this.currentAgent.id) {
                window.history.pushState({}, '', `/agent/${this.currentAgent.id}`);
            }
            else {
                console.error('Could not fetch current tree: ' + this.currentAgentId);
            }
        }
    }
    async fetchCurrentAgent() {
        this.isFetchingAgent = true;
        //this.currentAgent = undefined; //  await this.api.getAgent(this.currentAgentId as number);
        this.isFetchingAgent = false;
        if (false && this.currentAgent) {
            this.updatePath();
            await this.updateComplete;
            this.$$('#context').value =
                this.currentAgent.Class.configuration.description;
            this.$$('#undesirableEffects').value = '';
            this.activeTabIndex = 1;
            this.$$('#tabBar').activeTabIndex = 1;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('open-add-cause-dialog', this.openAddCauseDialog);
        this.removeEventListener('close-add-cause-dialog', this.closeAddCauseDialog);
    }
    camelCaseToHumanReadable(str) {
        // Split the string at each uppercase letter and join with space
        const words = str.replace(/([A-Z])/g, ' $1').trim();
        // Capitalize the first letter of the resulting string
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
    static get styles() {
        return [
            super.styles,
            css `
        md-tabs {
          margin-bottom: 64px;
        }

        .nodeEditHeadlineImage {
          max-width: 100px;
          margin-right: 16px;
        }

        .nodeEditHeadlineTitle {
          display: flex;
          align-items: center;
          justify-content: center; /* This will also center the content horizontally */
          height: 55px; /* Make sure this element has a defined height */
        }

        .childEditing {
          color: var(--md-sys-color-on-surface-variant);
          background-color: var(--md-sys-color-surface-variant);
          padding: 16px;
          border-radius: 8px;
        }

        .childrenList {
          height: 100px;
          overflow-y: auto;
        }

        md-icon-button {
          margin-top: 32px;
        }

        .createOptionsButtons {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding-left: 8px;
          padding-right: 8px;
        }

        .deleteButton {
          --md-sys-color-primary: var(--md-sys-color-error);
        }

        md-circular-progress {
          margin-bottom: 6px;
        }

        md-filled-text-field,
        md-outlined-text-field {
          width: 600px;
          margin-bottom: 16px;
        }

        [type='textarea'] {
          min-height: 150px;
        }

        [type='textarea'][supporting-text] {
          min-height: 76px;
        }

        .formContainer {
          margin-top: 32px;
        }

        md-filled-button,
        md-outlined-button {
          margin-top: 8px;
          margin-left: 8px;
          margin-right: 8px;
          margin-bottom: 8px;
        }

        .aiConfigReview {
          margin-left: 8px;
          margin-right: 8px;
          padding: 16px;
          margin-top: 8px;
          margin-bottom: 8px;
          border-radius: 12px;
          max-width: 560px;
          font-size: 14px;
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        .agentUDEDescription {
          font-size: 18px;
          margin: 32px;
          margin-bottom: 0;
          padding: 24px;
          border-radius: 12px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        md-tabs,
        agent-tab,
        configure-tab {
          width: 100%;
        }

        .themeToggle {
          margin-top: 32px;
        }

        ltp-chat-assistant {
          height: 100%;
          max-height: 100%;
          width: 100%;
          height: 100%;
        }

        md-linear-progress {
          width: 600px;
        }

        .darkModeButton {
          margin-right: 8px;
          margin-left: 8px;
        }

        .topDiv {
          margin-bottom: 256px;
        }

        md-outlined-select {
          z-index: 1500px;
          margin: 16px;
          margin-left: 0;
          max-width: 250px;
        }

        .automaticCreateButton {
          max-width: 300px;
        }

        [hidden] {
          display: none !important;
        }
      `,
        ];
    }
    tabChanged() {
        this.activeTabIndex = this.$$('#tabBar').activeTabIndex;
    }
    clearForNew() {
        this.currentAgent = undefined;
        this.currentAgentId = undefined;
        this.AIConfigReview = undefined;
        this.$$('#context').value = '';
        this.$$('#undesirableEffects').value = '';
        //window.history.pushState({}, '', `/agent`);
    }
    get agentInputData() {
        return {
            description: this.$$('#description')?.value ?? '',
            context: this.$$('#context').value ?? '',
            undesirableEffects: this.$$('#undesirableEffects').value.split('\n') ?? [],
            nodes: [],
        }; //LtpCurrentRealityAgentData;
    }
    async reviewAgentConfiguration() {
        this.isReviewingAgent = true;
        if (this.currentStreaminReponse) {
            this.currentStreaminReponse.close();
        }
        if (this.wsMessageListener) {
            this.removeEventListener('wsMessage', this.wsMessageListener);
        }
        this.AIConfigReview = undefined;
        this.currentStreaminReponse = new OpsStreamingAIResponse(this);
        try {
            const wsClientId = await this.currentStreaminReponse.connect();
            this.AIConfigReview = '';
            console.log('Connected with clientId:', wsClientId);
            this.wsMessageListener = (event) => {
                const { data } = event.detail;
                if (data.type === 'part' && data.text) {
                    this.AIConfigReview += data.text;
                }
                else if (data.type === 'end') {
                    this.removeListener('wsMessage', this.wsMessageListener);
                    this.wsMessageListener = undefined;
                    this.currentStreaminReponse = undefined;
                    this.isReviewingAgent = false;
                }
            };
            this.addEventListener('wsMessage', this.wsMessageListener);
            await this.api.reviewConfiguration(wsClientId, this.agentInputData);
            // Proceed with your logic
        }
        catch (error) {
            console.error('WebSocket connection failed:', error);
            this.removeListener('wsMessage', this.wsMessageListener);
        }
    }
    async createAgent() {
        this.isCreatingAgent = true;
        const agentSeed = this.agentInputData;
        if (TESTING && this.$$('#context').value == '') {
            agentSeed.context =
                'We are a software company with a product we have as as service';
            agentSeed.undesirableEffects = ['End users are unhappy with the service'];
        }
        //this.currentAgent = await this.api.createAgent(agentSeed);
        this.updatePath();
        this.isCreatingAgent = false;
        this.activeTabIndex = 1;
        this.$$('#tabBar').activeTabIndex = 1;
    }
    toggleDarkMode() {
        this.fire('yp-theme-dark-mode', !this.themeDarkMode);
        window.psAppGlobals.activity('Agent - toggle darkmode');
        if (this.themeDarkMode) {
            window.psAppGlobals.activity('Settings - dark mode');
            localStorage.setItem('md3-ps-dark-mode', 'true');
        }
        else {
            window.psAppGlobals.activity('Settings - light mode');
            localStorage.removeItem('md3-ps-dark-mode');
        }
    }
    randomizeTheme() {
        // Create a random hex color
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        // Set the theme color
        this.fire('yp-theme-color', `#${randomColor}`);
    }
    renderAIConfigReview() {
        return html `
      <div class="aiConfigReview" id="aiConfigReview">
        ${this.AIConfigReview
            ? html `
              ${resolveMarkdown(this.AIConfigReview, {
                includeImages: true,
                includeCodeBlockClassNames: true,
            })}
            `
            : nothing}
      </div>
    `;
    }
    renderReviewAndSubmit() {
        return html `
      <md-outlined-button
        @click="${this.reviewAgentConfiguration}"
        ?hidden="${!this.AIConfigReview || this.currentAgent != undefined}"
        >${this.t('Review CRT again')}<md-icon slot="icon"
          >rate_review</md-icon
        ></md-outlined-button
      >
      <md-filled-button
        @click="${this.reviewAgentConfiguration}"
        ?hidden="${this.AIConfigReview != undefined ||
            this.currentAgent != undefined}"
        ?disabled="${this.isReviewingAgent}"
        >${this.t('Review CRT')}<md-icon slot="icon"
          >rate_review</md-icon
        ></md-filled-button
      >
    `;
    }
    renderThemeToggle() {
        return html `<div class="layout horizontal center-center themeToggle">
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

      <md-outlined-icon-button
        class="darkModeButton"
        @click="${this.randomizeTheme}"
        ><md-icon>shuffle</md-icon></md-outlined-icon-button
      >
    </div> `;
    }
    renderConfiguration() {
        return html `
      <div class="layout vertical center-center topDiv">
        ${this.renderThemeToggle()}

        <div class="formContainer">
          <div>
            <md-outlined-text-field
              type="textarea"
              label="Context"
              id="context"
            ></md-outlined-text-field>
          </div>

          <div>
            <md-outlined-text-field
              type="textarea"
              label="Undesirable Effects"
              id="undesirableEffects"
            ></md-outlined-text-field>
          </div>

          <div class="layout horizontal center-center">
            <md-outlined-button
              @click="${this.clearForNew}"
              ?hidden="${!this.currentAgent}"
              >${this.t('Create New Agent')}<md-icon slot="icon"
                >rate_review</md-icon
              ></md-outlined-button
            >

            ${this.renderReviewAndSubmit()}

            <md-filled-button
              @click="${this.createAgent}"
              ?hidden="${!this.AIConfigReview ||
            this.currentAgent != undefined}"
              ?disabled="${this.isReviewingAgent}"
              >${this.t('Create CRT')}<md-icon slot="icon"
                >send</md-icon
              ></md-filled-button
            >
          </div>

          ${this.isReviewingAgent && !this.AIConfigReview
            ? html `<md-linear-progress indeterminate></md-linear-progress>`
            : nothing}
          ${this.AIConfigReview ? this.renderAIConfigReview() : nothing}
        </div>
      </div>
    `;
    }
    /*findNodeRecursively = (
      nodes: LtpCurrentRealityAgentDataNode[],
      nodeId: string
    ): LtpCurrentRealityAgentDataNode | undefined => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node;
        }
        if (node.children) {
          const foundNode = this.findNodeRecursively(node.children, nodeId);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return undefined;
    };*/
    openAddCauseDialog(event) {
        console.error(`openAddCauseDialog ${event.detail.parentNodeId}`);
        const parentNodeId = event.detail.parentNodeId;
        // Get the node from the tree recursively
        // Find the node recursively
        /* const node = this.findNodeRecursively(this.currentAgent?.nodes || [], parentNodeId);
        if (!node) {
          console.error(`Could not find node ${parentNodeId}`);
          console.error(JSON.stringify(this.currentAgent, null, 2));
          return;
        }
        this.nodeToAddCauseTo = node;
        (this.$$("#addCauseDialog") as MdDialog).show();*/
    }
    closeAddCauseDialog() {
        this.$$('#addCauseDialog').close();
        this.nodeToAddCauseTo = undefined;
    }
    renderAddCauseDialog() {
        return html `
      <md-dialog
        id="addCauseDialog"
        style="max-width: 800px;max-height: 90vh;"
        @closed="${this.closeAddCauseDialog}"
      >
        <div slot="headline">${ /*this.nodeToAddCauseTo?.description*/''}</div>
        <div slot="content" class="chatContainer">
          ${this.nodeToAddCauseTo
            ? html `
                <ltp-chat-assistant
                  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
                  method="dialog"
                  .textInputLabel="${this.t('Enter sufficent direct causes to the effect')}"
                  .agentData="${this.currentAgent}"
                  @close="${this.closeAddCauseDialog}"
                >
                </ltp-chat-assistant>
              `
            : nothing}
        </div>
      </md-dialog>
    `;
    }
    renderTotalCosts() {
        return html `${this.t('Costs')}
    ${this.totalCosts !== undefined ? `($${this.totalCosts.toFixed(2)})` : ''}`;
    }
    render() {
        if (this.isFetchingAgent) {
            return html `<md-linear-progress indeterminate></md-linear-progress>`;
        }
        else {
            return cache(html `
        ${this.renderAddCauseDialog()} ${this.renderEditNodeDialog()}
        ${this.renderDeleteConfirmationDialog()}
        <md-tabs id="tabBar" @change="${this.tabChanged}">
          <md-primary-tab id="configure-tab" aria-controls="configure-panel">
            <md-icon slot="icon">support_agent</md-icon>
            ${this.t('Agents Operations')}
          </md-primary-tab>
          <md-primary-tab id="crt-tab" aria-controls="crt-panel" +>
            <md-icon slot="icon">checklist</md-icon>
            ${this.t('Audit Log')}
          </md-primary-tab>
          <md-primary-tab id="crt-tab" aria-controls="crt-panel" +>
            <md-icon slot="icon">account_balance</md-icon>
            ${this.renderTotalCosts()}
          </md-primary-tab>
        </md-tabs>
        <ps-operations-view
          .currentAgent="${this.currentAgent}"
        ></ps-operations-view>
      `);
        }
    }
};
__decorate([
    property({ type: Number })
], PsOperationsManager.prototype, "currentAgentId", void 0);
__decorate([
    property({ type: Number })
], PsOperationsManager.prototype, "totalCosts", void 0);
__decorate([
    property({ type: Object })
], PsOperationsManager.prototype, "currentAgent", void 0);
__decorate([
    property({ type: Boolean })
], PsOperationsManager.prototype, "isFetchingAgent", void 0);
__decorate([
    property({ type: Object })
], PsOperationsManager.prototype, "nodeToEditInfo", void 0);
__decorate([
    property({ type: Object })
], PsOperationsManager.prototype, "nodeToEdit", void 0);
__decorate([
    property({ type: Array })
], PsOperationsManager.prototype, "allCausesExceptCurrentToEdit", void 0);
__decorate([
    property({ type: Boolean })
], PsOperationsManager.prototype, "showDeleteConfirmation", void 0);
__decorate([
    property({ type: Number })
], PsOperationsManager.prototype, "activeTabIndex", void 0);
__decorate([
    property({ type: String })
], PsOperationsManager.prototype, "currentlySelectedCauseIdToAddAsChild", void 0);
__decorate([
    property({ type: String })
], PsOperationsManager.prototype, "AIConfigReview", void 0);
__decorate([
    property({ type: Boolean })
], PsOperationsManager.prototype, "isReviewingAgent", void 0);
__decorate([
    property({ type: Boolean })
], PsOperationsManager.prototype, "isCreatingAgent", void 0);
__decorate([
    query('ps-operations-view')
], PsOperationsManager.prototype, "agentElement", void 0);
__decorate([
    property({ type: Object })
], PsOperationsManager.prototype, "nodeToAddCauseTo", void 0);
PsOperationsManager = __decorate([
    customElement('ps-operations-manager')
], PsOperationsManager);
export { PsOperationsManager };
//# sourceMappingURL=ps-operations-manager.js.map