import { PropertyValueMap, css, html, nothing } from 'lit';
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

import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import '@material/web/button/filled-button.js';

import { MdTabs } from '@material/web/tabs/tabs.js';

import './ps-operations-view.js';
import './OpsServerApi.js';
import { OpsServerApi } from './OpsServerApi.js';

import './chat/agent-chat-assistant.js';
import { MdDialog } from '@material/web/dialog/dialog.js';
import { OpsStreamingAIResponse } from './OpsStreamingAIResponse.js';
import { PsOperationsView } from './ps-operations-view.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

import { PsOperationsBaseNode } from './ps-operations-base-node.js';

const TESTING = false;

const nodeTypes = [
  'ude',
  'directCause',
  'assumption',
  'intermediateCause',
  'rootCause',
  'and',
  'xor',
  'mag',
];

@customElement('ps-operations-manager')
export class PsOperationsManager extends YpBaseElement {
  @property({ type: Number })
  currentAgentId: number | undefined;

  @property({ type: Object })
  currentAgent: PsAgentInstance | undefined;

  @property({ type: Boolean })
  isFetchingAgent = false;

  @property({ type: Object })
  nodeToEditInfo: PsAgentInstance | PsAgentConnectorInstance | undefined;

  @property({ type: Object })
  nodeToEdit: PsOperationsBaseNode | undefined;

  @property({ type: Array })
  allCausesExceptCurrentToEdit: PsOperationsBaseNode[] = [];

  @property({ type: Boolean })
  showDeleteConfirmation = false;

  @property({ type: Number })
  activeTabIndex = 0;

  @property({ type: String })
  currentlySelectedCauseIdToAddAsChild: string | undefined;

  @property({ type: String })
  AIConfigReview: string | undefined;

  @property({ type: Boolean })
  isReviewingAgent = false;

  @property({ type: Boolean })
  isCreatingAgent = false;

  @query('ps-operations-view')
  agentElement!: PsOperationsView;

  api: OpsServerApi;

  @property({ type: Object })
  nodeToAddCauseTo: PsOperationsBaseNode | undefined;
  wsMessageListener: ((event: any) => void) | undefined = undefined;

  currentStreaminReponse: OpsStreamingAIResponse | undefined;

  constructor() {
    super();
    this.api = new OpsServerApi();
    this.setupTestData();
  }

  setupTestData() {
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'open-add-cause-dialog',
      this.openAddCauseDialog as EventListenerOrEventListenerObject
    );

    this.addEventListener(
      'close-add-cause-dialog',
      this.closeAddCauseDialog as EventListenerOrEventListenerObject
    );

    if (this.currentAgentId) {
      this.fetchCurrentAgent();
    }

    this.addEventListener(
      'edit-node',
      this.openEditNodeDialog as EventListenerOrEventListenerObject
    );
  }

  openEditNodeDialog(event: CustomEvent) {
    this.nodeToEditInfo = event.detail;

    this.currentlySelectedCauseIdToAddAsChild = undefined;

    /*this.nodeToEdit = this.findNodeRecursively(
      this.currentAgent?.subAgents || [],
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

    (this.$$('#editNodeDialog') as MdDialog).show();
  }

  closeEditNodeDialog() {
    (this.$$('#editNodeDialog') as MdDialog).close();
    this.nodeToEdit = undefined;
    this.nodeToEditInfo = undefined;
  }

  addChildChanged() {
    const effectIdSelect = this.$$('#addEffectToNodeId') as HTMLSelectElement;
    this.currentlySelectedCauseIdToAddAsChild = effectIdSelect.value;
  }

  async handleSaveEditNode() {
    const updatedDescription = (
      this.$$('#nodeDescription') as MdOutlinedTextField
    ).value;

    // Retrieve the selected node type from md-select
    const nodeTypeSelect = this.$$('#nodeTypeSelect') as HTMLSelectElement;
    const selectedNodeType = nodeTypeSelect.value;

    if (this.nodeToEdit) {
      //this.nodeToEdit.description = updatedDescription;

      // Update the node type if one is selected
      if (selectedNodeType) {
        //this.nodeToEdit.type = selectedNodeType as AgentNodeType;
      }

      if (this.currentAgentId) {
        try {
          await this.api.updateNode(this.currentAgentId, this.nodeToEdit);

          // Update the node in the agent object
          /*const nodeToUpdate = this.findNodeRecursively(
            this.currentAgent?.subAgents || [],
            this.nodeToEdit.id
          );
          if (nodeToUpdate) {
            nodeToUpdate.description = updatedDescription;
            if (selectedNodeType) {
              nodeToUpdate.type = selectedNodeType as AgentNodeType;
            }
          }*/

          this.closeEditNodeDialog();
          //TODO: Do this with less brute force, actually update the element
          this.currentAgent = { ...this.currentAgent };
        } catch (error) {
          console.error('Error updating node:', error);
        }
      }
    }
  }

  handleDeleteNode() {
    this.showDeleteConfirmation = true;
  }

  removeNodeRecursively(nodes: PsOperationsBaseNode[], nodeId: string) {
    const index = nodes.findIndex(node => node.id === nodeId);
    if (index !== -1) {
      nodes.splice(index, 1);
      return;
    }
    nodes.forEach(node => {
      if (node.children) {
        //this.removeNodeRecursively(node.subAgents, nodeId);
      }
    });
  }

  async confirmDeleteNode() {
    if (this.nodeToEdit && this.currentAgentId) {
      try {
        await this.api.deleteNode(this.currentAgentId, this.nodeToEdit.id);

        // Remove the node from the agent object
        // this.removeNodeRecursively(this.currentAgent?.subAgents || [], this.nodeToEdit.id);
        this.closeEditNodeDialog();
        this.currentAgent = { ...this.currentAgent };
      } catch (error) {
        console.error('Error deleting node:', error);
      } finally {
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
    return html`
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

  renderEditNodeDialog() {
    return html`
      <md-dialog
        id="editNodeDialog"
        style="max-width: 800px; max-height: 90vh;"
        @closed="${this.closeEditNodeDialog}"
      >
        <div slot="headline">Edit Node</div>
        <div
          slot="content"
          id="editNodeForm"
          style="max-height: 90vh;height: 500px;"
          class="layout vertical"
        >
          ${this.nodeToEditInfo
            ? html`
                <md-outlined-text-field
                  label="Description"
                  .value="${/*this.nodeToEdit?.description*/ ''}"
                  id="nodeDescription"
                ></md-outlined-text-field>
                <md-outlined-select
                  menuPositioning="fixed"
                  label="Node Type"
                  id="nodeTypeSelect"
                >
                  ${nodeTypes
                    .filter(type => type !== undefined)
                    .map(
                      type => html`
                        <md-select-option
                          value="${type}"
                          ?selected="${
                            /*this.nodeToEditInfo!.element.agentNodeType == type*/ 0
                          }"
                        >
                          <div slot="headline">
                            ${this.camelCaseToHumanReadable(type)}
                          </div>
                        </md-select-option>
                      `
                    )}
                </md-outlined-select>
                <div class="flex"></div>

                <div class="childEditing">
                  <div class="layout horizontal">
                    <md-outlined-select
                      menuPositioning="fixed"
                      label="Add as Effect to"
                      id="addEffectToNodeId"
                      @change="${this.addChildChanged}"
                    >
                      ${this.allCausesExceptCurrentToEdit.map(
                        node => html`
                          <md-select-option value="${node.id}">
                            <div slot="headline">
                              ${/*node.description*/ ''}
                            </div>
                          </md-select-option>
                        `
                      )}
                    </md-outlined-select>
                    ${this.currentlySelectedCauseIdToAddAsChild
                      ? html`
                          <md-text-button class="addButton">
                            Add as an Effect
                          </md-text-button>
                        `
                      : nothing}
                  </div>

                  <div class="flex"></div>

                  <div class="layout horizontal center-center">
                    <md-text-button
                      class="automaticCreateButton"
                      @click="${this.createDirectCauses}"
                    >
                      Automatically create nodes (for testing)
                    </md-text-button>
                  </div>
                </div>
              `
            : nothing}
        </div>
        <div slot="actions">
          <md-text-button
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
      } else {
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

      (this.$$('#context') as MdOutlinedTextField).value =
        this.currentAgent.class.description;
      (this.$$('#undesirableEffects') as MdOutlinedTextField).value = '';

      this.activeTabIndex = 1;
      (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
    }
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.updated(changedProperties);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(
      'open-add-cause-dialog',
      this.openAddCauseDialog as EventListenerOrEventListenerObject
    );
    this.removeEventListener(
      'close-add-cause-dialog',
      this.closeAddCauseDialog as EventListenerOrEventListenerObject
    );
  }
  camelCaseToHumanReadable(str: string) {
    // Split the string at each uppercase letter and join with space
    const words = str.replace(/([A-Z])/g, ' $1').trim();

    // Capitalize the first letter of the resulting string
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  static override get styles() {
    return [
      super.styles,
      css`

      md-tabs {
        margin-bottom: 64px;
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
    this.activeTabIndex = (this.$$('#tabBar') as MdTabs).activeTabIndex;
  }

  clearForNew() {
    this.currentAgent = undefined;
    this.currentAgentId = undefined;
    this.AIConfigReview = undefined;
    (this.$$('#context') as MdOutlinedTextField).value = '';
    (this.$$('#undesirableEffects') as MdOutlinedTextField).value = '';
    //window.history.pushState({}, '', `/agent`);
  }

  get agentInputData() {
    return {
      description:
        (this.$$('#description') as MdOutlinedTextField)?.value ?? '',
      context: (this.$$('#context') as MdOutlinedTextField).value ?? '',
      undesirableEffects:
        (this.$$('#undesirableEffects') as MdOutlinedTextField).value.split(
          '\n'
        ) ?? [],
      nodes: [],
    } as any; //LtpCurrentRealityAgentData;
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

      this.wsMessageListener = (event: any) => {
        const { data } = event.detail;
        if (data.type === 'part' && data.text) {
          this.AIConfigReview += data.text;
        } else if (data.type === 'end') {
          this.removeListener('wsMessage', this.wsMessageListener!);
          this.wsMessageListener = undefined;
          this.currentStreaminReponse = undefined;
          this.isReviewingAgent = false;
        }
      };

      this.addEventListener('wsMessage', this.wsMessageListener);

      await this.api.reviewConfiguration(wsClientId, this.agentInputData);

      // Proceed with your logic
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.removeListener('wsMessage', this.wsMessageListener!);
    }
  }

  async createAgent() {
    this.isCreatingAgent = true;

    const agentSeed = this.agentInputData;

    if (TESTING && (this.$$('#context') as MdOutlinedTextField).value == '') {
      agentSeed.context =
        'We are a software company with a product we have as as service';
      agentSeed.undesirableEffects = ['End users are unhappy with the service'];
    }

    //this.currentAgent = await this.api.createAgent(agentSeed);

    this.updatePath();

    this.isCreatingAgent = false;
    this.activeTabIndex = 1;
    (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
  }

  toggleDarkMode() {
    this.fire('yp-theme-dark-mode', !this.themeDarkMode);
    window.psAppGlobals.activity('Agent - toggle darkmode');
    if (this.themeDarkMode) {
      window.psAppGlobals.activity('Settings - dark mode');
      localStorage.setItem('md3-ps-dark-mode', 'true');
    } else {
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
    return html`
      <div class="aiConfigReview" id="aiConfigReview">
        ${this.AIConfigReview
          ? html`
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
    return html`
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
    return html`<div class="layout horizontal center-center themeToggle">
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

      <md-outlined-icon-button
        class="darkModeButton"
        @click="${this.randomizeTheme}"
        ><md-icon>shuffle</md-icon></md-outlined-icon-button
      >
    </div> `;
  }

  renderConfiguration() {
    return html`
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
            ? html`<md-linear-progress indeterminate></md-linear-progress>`
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

  openAddCauseDialog(event: CustomEvent) {
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
    (this.$$('#addCauseDialog') as MdDialog).close();
    this.nodeToAddCauseTo = undefined;
  }

  renderAddCauseDialog() {
    return html`
      <md-dialog
        id="addCauseDialog"
        style="max-width: 800px;max-height: 90vh;"
        @closed="${this.closeAddCauseDialog}"
      >
        <div slot="headline">${/*this.nodeToAddCauseTo?.description*/ ''}</div>
        <div slot="content" class="chatContainer">
          ${this.nodeToAddCauseTo
            ? html`
                <ltp-chat-assistant
                  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
                  method="dialog"
                  .textInputLabel="${this.t(
                    'Enter sufficent direct causes to the effect'
                  )}"
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

  render(): any {
    if (this.isFetchingAgent) {
      return html`<md-linear-progress indeterminate></md-linear-progress>`;
    } else {
      return cache(html`
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
            ${this.t('Costs')}
          </md-primary-tab>
        </md-tabs>
        <ps-operations-view
          .currentAgent="${this.currentAgent}"
        ></ps-operations-view>
      `);
    }
  }
}
