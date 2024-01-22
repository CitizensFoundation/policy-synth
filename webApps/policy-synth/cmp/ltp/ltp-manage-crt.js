var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from "lit";
import { property, customElement, query } from "lit/decorators.js";
import { cache } from "lit/directives/cache.js";
import { resolveMarkdown } from "../chatBot/litMarkdown.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/linear-progress.js";
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/iconbutton/outlined-icon-button.js";
import "@material/web/button/filled-tonal-button.js";
import "@material/web/dialog/dialog.js";
import "@material/web/button/text-button.js";
import "@material/web/checkbox/checkbox.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import "@material/web/button/filled-button.js";
import { PsStageBase } from '../base/ps-stage-base.js';
import "./ltp-current-reality-tree.js";
import "./LtpServerApi.js";
import { LtpServerApi } from "./LtpServerApi.js";
import "./chat/ltp-chat-assistant.js";
import { LtpStreamingAIResponse } from "./LtpStreamingAIResponse.js";
const TESTING = false;
const nodeTypes = [
    "ude",
    "directCause",
    "assumption",
    "intermediateCause",
    "rootCause",
    "and",
    "xor",
    "mag",
];
let LtpManageCrt = class LtpManageCrt extends PsStageBase {
    constructor() {
        super();
        this.isCreatingCrt = false;
        this.isFetchingCrt = false;
        this.allCausesExceptCurrentToEdit = [];
        this.showDeleteConfirmation = false;
        this.activeTabIndex = 0;
        this.isReviewingCrt = false;
        this.wsMessageListener = undefined;
        this.findNodeRecursively = (nodes, nodeId) => {
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
        };
        this.api = new LtpServerApi();
    }
    async connectedCallback() {
        super.connectedCallback();
        this.addEventListener("open-add-cause-dialog", this.openAddCauseDialog);
        this.addEventListener("close-add-cause-dialog", this.closeAddCauseDialog);
        if (this.currentTreeId) {
            this.fetchCurrentTree();
        }
        this.addEventListener("edit-node", this.openEditNodeDialog);
    }
    openEditNodeDialog(event) {
        this.nodeToEditInfo = event.detail;
        this.currentlySelectedCauseIdToAddAsChild = undefined;
        this.nodeToEdit = this.findNodeRecursively(this.crt?.nodes || [], this.nodeToEditInfo.nodeId);
        if (!this.nodeToEdit) {
            console.error(`Could not find node ${this.nodeToEditInfo.nodeId}`);
            console.error(JSON.stringify(this.crt, null, 2));
            return;
        }
        const childrenIds = (this.nodeToEdit.children || []).map((child) => child.id);
        childrenIds.push(this.nodeToEdit.id);
        this.allCausesExceptCurrentToEdit =
            this.crtElement.getAllCausesExcept(childrenIds);
        this.$$("#editNodeDialog").show();
    }
    closeEditNodeDialog() {
        this.$$("#editNodeDialog").close();
        this.nodeToEdit = undefined;
        this.nodeToEditInfo = undefined;
    }
    addChildChanged() {
        const effectIdSelect = this.$$("#addEffectToNodeId");
        this.currentlySelectedCauseIdToAddAsChild = effectIdSelect.value;
    }
    async handleSaveEditNode() {
        const updatedDescription = this.$$("#nodeDescription").value;
        // Retrieve the selected node type from md-select
        const nodeTypeSelect = this.$$("#nodeTypeSelect");
        const selectedNodeType = nodeTypeSelect.value;
        if (this.nodeToEdit) {
            this.nodeToEdit.description = updatedDescription;
            // Update the node type if one is selected
            if (selectedNodeType) {
                this.nodeToEdit.type = selectedNodeType;
            }
            if (this.currentTreeId) {
                try {
                    await this.api.updateNode(this.currentTreeId, this.nodeToEdit);
                    // Update the node in the crt object
                    const nodeToUpdate = this.findNodeRecursively(this.crt?.nodes || [], this.nodeToEdit.id);
                    if (nodeToUpdate) {
                        nodeToUpdate.description = updatedDescription;
                        if (selectedNodeType) {
                            nodeToUpdate.type = selectedNodeType;
                        }
                    }
                    this.closeEditNodeDialog();
                    //TODO: Do this with less brute force, actually update the element
                    this.crt = { ...this.crt };
                }
                catch (error) {
                    console.error("Error updating node:", error);
                }
            }
        }
    }
    handleDeleteNode() {
        this.showDeleteConfirmation = true;
    }
    removeNodeRecursively(nodes, nodeId) {
        const index = nodes.findIndex((node) => node.id === nodeId);
        if (index !== -1) {
            nodes.splice(index, 1);
            return;
        }
        nodes.forEach((node) => {
            if (node.children) {
                this.removeNodeRecursively(node.children, nodeId);
            }
        });
    }
    async confirmDeleteNode() {
        if (this.nodeToEdit && this.currentTreeId) {
            try {
                await this.api.deleteNode(this.currentTreeId, this.nodeToEdit.id);
                // Remove the node from the crt object
                this.removeNodeRecursively(this.crt?.nodes || [], this.nodeToEdit.id);
                this.closeEditNodeDialog();
                this.crt = { ...this.crt };
            }
            catch (error) {
                console.error("Error deleting node:", error);
            }
            finally {
                this.closeDeleteConfirmationDialog();
            }
        }
    }
    createDirectCauses() {
        if (this.nodeToEditInfo) {
            this.nodeToEditInfo.element.createDirectCauses();
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
    renderEditNodeDialog() {
        return html `
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
            ? html `
                <md-outlined-text-field
                  label="Description"
                  .value="${this.nodeToEdit?.description || ""}"
                  id="nodeDescription"
                ></md-outlined-text-field>
                <md-outlined-select
                  menuPositioning="fixed"
                  label="Node Type"
                  id="nodeTypeSelect"
                >
                  ${nodeTypes
                .filter((type) => type !== undefined)
                .map((type) => html `
                        <md-select-option
                          value="${type}"
                          ?selected="${this.nodeToEditInfo.element
                .crtNodeType == type}"
                        >
                          <div slot="headline">
                            ${this.camelCaseToHumanReadable(type)}
                          </div>
                        </md-select-option>
                      `)}
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
                    ${this.allCausesExceptCurrentToEdit.map((node) => html `
                        <md-select-option value="${node.id}">
                          <div slot="headline">${node.description}</div>
                        </md-select-option>
                      `)}
                  </md-outlined-select>
                  ${this.currentlySelectedCauseIdToAddAsChild
                ? html `
                        <md-text-button
                          class="addButton"
                          @click="${this.addChildToCurrentNode}"
                        >
                          Add as an Effect
                        </md-text-button>
                      `
                : nothing}
                </div>

                ${this.nodeToEdit?.children &&
                this.nodeToEdit?.children.length > 0
                ? html `
                      <div class="childrenList">
                        ${this.nodeToEdit.children.map((child) => html `
                            <div class="childItem">
                              <span>${child.description}</span>
                              <md-icon-button
                                @click="${() => this.removeChildNode(child.id)}"
                              >
                                <md-icon>delete</md-icon>
                              </md-icon-button>
                            </div>
                          `)}
                      </div>
                    `
                : nothing}
                </div>
                <div class="flex"></div>

                <div class="layout horizontal center-center">
                  <md-text-button
                    class="automaticCreateButton"
                    ?hidden="${this.nodeToEditInfo.element.type == "rootCause"}"
                    @click="${this.createDirectCauses}"
                  >
                    Automatically create nodes (for testing)
                  </md-text-button>
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
            if (this.crt && this.crt.id) {
                window.history.pushState({}, "", `/crt/${this.crt.id}`);
            }
            else {
                console.error("Could not fetch current tree: " + this.currentTreeId);
            }
        }
    }
    async addChildToCurrentNode() {
        if (this.currentlySelectedCauseIdToAddAsChild && this.nodeToEdit) {
            if (!this.nodeToEdit.children) {
                this.nodeToEdit.children = [];
            }
            // Find the node in this.crt corresponding to the selected ID
            const childNodeToAdd = this.findNodeById(this.crt.nodes, this.currentlySelectedCauseIdToAddAsChild);
            if (childNodeToAdd) {
                // Add the full node object to this.nodeToEdit.children
                this.nodeToEdit.children.unshift(childNodeToAdd);
                // Update the node on the server side with the new children IDs
                try {
                    await this.api.updateNodeChildren(this.currentTreeId, this.nodeToEdit.id, this.nodeToEdit.children.map(child => child.id));
                    // Update local state
                    this.crt = { ...this.crt };
                    this.requestUpdate();
                }
                catch (error) {
                    console.error("Error updating node with new child ID:", error);
                }
            }
            else {
                console.error(`Child node with ID ${this.currentlySelectedCauseIdToAddAsChild} not found`);
            }
        }
    }
    // Helper function to find a node by ID
    findNodeById(nodes, id) {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children) {
                const foundNode = this.findNodeById(node.children, id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }
    async removeChildNode(childIdToRemove) {
        if (this.nodeToEdit && this.nodeToEdit.children) {
            // Filter out the child ID to remove
            this.nodeToEdit.children = this.nodeToEdit.children.filter((child) => child.id !== childIdToRemove);
            // Prepare the data for the API call
            const updatedChildrenIds = this.nodeToEdit.children.map((child) => child.id);
            // Call API to update the node
            try {
                await this.api.updateNodeChildren(this.currentTreeId, this.nodeToEdit.id, updatedChildrenIds);
                this.crt = { ...this.crt };
                this.requestUpdate();
            }
            catch (error) {
                console.error("Error updating node after removing child ID:", error);
                // Handle error
            }
        }
        else {
            console.error('Could not fetch current tree: ' + this.currentTreeId);
        }
    }
    async fetchCurrentTree() {
        this.isFetchingCrt = true;
        this.crt = await this.api.getCrt(this.currentTreeId);
        this.isFetchingCrt = false;
        if (this.crt) {
            this.updatePath();
            await this.updateComplete;
            this.$$("#context").value = this.crt.context;
            this.$$("#undesirableEffects").value =
                this.crt.undesirableEffects.join("\n");
            this.activeTabIndex = 1;
            this.$$("#tabBar").activeTabIndex = 1;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("open-add-cause-dialog", this.openAddCauseDialog);
        this.removeEventListener("close-add-cause-dialog", this.closeAddCauseDialog);
    }
    camelCaseToHumanReadable(str) {
        // Split the string at each uppercase letter and join with space
        const words = str.replace(/([A-Z])/g, " $1").trim();
        // Capitalize the first letter of the resulting string
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
    static get styles() {
        return [
            super.styles,
            css `
        .causeText {
          font-size: 12px;
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          padding: 8px;
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

        [type="textarea"] {
          min-height: 150px;
        }

        [type="textarea"][supporting-text] {
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

        .crtUDEDescription {
          font-size: 18px;
          margin: 32px;
          margin-bottom: 0;
          padding: 24px;
          border-radius: 12px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        md-tabs,
        crt-tab,
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
        this.activeTabIndex = this.$$("#tabBar").activeTabIndex;
    }
    clearForNew() {
        this.crt = undefined;
        this.currentTreeId = undefined;
        this.AIConfigReview = undefined;
        this.$$("#context").value = "";
        this.$$("#undesirableEffects").value = "";
        //window.history.pushState({}, '', `/crt`);
    }
    get crtInputData() {
        return {
            description: this.$$("#description")?.value ?? "",
            context: this.$$("#context").value ?? "",
            undesirableEffects: this.$$("#undesirableEffects").value.split("\n") ?? [],
            nodes: [],
        };
    }
    async reviewTreeConfiguration() {
        this.isReviewingCrt = true;
        if (this.currentStreaminReponse) {
            this.currentStreaminReponse.close();
        }
        if (this.wsMessageListener) {
            this.removeEventListener("wsMessage", this.wsMessageListener);
        }
        this.AIConfigReview = undefined;
        this.currentStreaminReponse = new LtpStreamingAIResponse(this);
        try {
            const wsClientId = await this.currentStreaminReponse.connect();
            this.AIConfigReview = "";
            console.log("Connected with clientId:", wsClientId);
            this.wsMessageListener = (event) => {
                const { data } = event.detail;
                if (data.type === "part" && data.text) {
                    this.AIConfigReview += data.text;
                }
                else if (data.type === "end") {
                    this.removeListener("wsMessage", this.wsMessageListener);
                    this.wsMessageListener = undefined;
                    this.currentStreaminReponse = undefined;
                    this.isReviewingCrt = false;
                }
            };
            this.addEventListener("wsMessage", this.wsMessageListener);
            await this.api.reviewConfiguration(wsClientId, this.crtInputData);
            // Proceed with your logic
        }
        catch (error) {
            console.error("WebSocket connection failed:", error);
            this.removeListener("wsMessage", this.wsMessageListener);
        }
    }
    async createTree() {
        this.isCreatingCrt = true;
        const crtSeed = this.crtInputData;
        if (TESTING && this.$$("#context").value == "") {
            crtSeed.context =
                "We are a software company with a product we have as as service";
            crtSeed.undesirableEffects = ["End users are unhappy with the service"];
        }
        this.crt = await this.api.createTree(crtSeed);
        this.currentTreeId = this.crt.id;
        this.updatePath();
        this.isCreatingCrt = false;
        this.activeTabIndex = 1;
        this.$$('#tabBar').activeTabIndex = 1;
    }
    toggleDarkMode() {
        this.fire('yp-theme-dark-mode', !this.themeDarkMode);
        window.psAppGlobals.activity('Crt - toggle darkmode');
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
        @click="${this.reviewTreeConfiguration}"
        ?hidden="${!this.AIConfigReview || this.crt != undefined}"
        >${this.t("Review CRT again")}<md-icon slot="icon"
          >rate_review</md-icon
        ></md-outlined-button
      >
      <md-filled-button
        @click="${this.reviewTreeConfiguration}"
        ?hidden="${this.AIConfigReview != undefined || this.crt != undefined}"
        ?disabled="${this.isReviewingCrt}"
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
              ?hidden="${!this.crt}"
              >${this.t("Create New Tree")}<md-icon slot="icon"
                >rate_review</md-icon
              ></md-outlined-button
            >

            ${this.renderReviewAndSubmit()}

            <md-filled-button
              @click="${this.createTree}"
              ?hidden="${!this.AIConfigReview || this.crt != undefined}"
              ?disabled="${this.isReviewingCrt}"
              >${this.t("Create CRT")}<md-icon slot="icon"
                >send</md-icon
              ></md-filled-button
            >
          </div>

          ${this.isReviewingCrt && !this.AIConfigReview
            ? html `<md-linear-progress indeterminate></md-linear-progress>`
            : nothing}
          ${this.AIConfigReview ? this.renderAIConfigReview() : nothing}
        </div>
      </div>
    `;
    }
    openAddCauseDialog(event) {
        console.error(`openAddCauseDialog ${event.detail.parentNodeId}`);
        const parentNodeId = event.detail.parentNodeId;
        // Get the node from the tree recursively
        // Find the node recursively
        const node = this.findNodeRecursively(this.crt?.nodes || [], parentNodeId);
        if (!node) {
            console.error(`Could not find node ${parentNodeId}`);
            console.error(JSON.stringify(this.crt, null, 2));
            return;
        }
        this.nodeToAddCauseTo = node;
        this.$$("#addCauseDialog").show();
    }
    closeAddCauseDialog() {
        this.$$("#addCauseDialog").close();
        this.nodeToAddCauseTo = undefined;
    }
    renderAddCauseDialog() {
        return html `
      <md-dialog
        id="addCauseDialog"
        style="max-width: 800px;max-height: 90vh;"
        @closed="${this.closeAddCauseDialog}"
      >
        <div slot="headline">${this.nodeToAddCauseTo?.description}</div>
        <div slot="content" class="chatContainer">
          ${this.nodeToAddCauseTo
            ? html `
                <ltp-chat-assistant
                  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
                  method="dialog"
                  .textInputLabel="${this.t("Enter sufficent direct causes to the effect")}"
                  .crtData="${this.crt}"
                  @close="${this.closeAddCauseDialog}"
                >
                </ltp-chat-assistant>
              `
            : nothing}
        </div>
      </md-dialog>
    `;
    }
    render() {
        if (this.isFetchingCrt) {
            return html `<md-linear-progress indeterminate></md-linear-progress>`;
        }
        else {
            return cache(html `
        ${this.renderAddCauseDialog()} ${this.renderEditNodeDialog()}
        ${this.renderDeleteConfirmationDialog()}
        <md-tabs id="tabBar" @change="${this.tabChanged}">
          <md-primary-tab id="configure-tab" aria-controls="configure-panel">
            <md-icon slot="icon">psychology</md-icon>
            ${this.t("Configuration")}
          </md-primary-tab>
          <md-primary-tab
            id="crt-tab"
            aria-controls="crt-panel"
            ?disabled="${!this.crt}"
          >
            <md-icon slot="icon">account_tree</md-icon>
            Current Reality Tree
          </md-primary-tab>
          <md-primary-tab
            id="crt-tab"
            aria-controls="crt-panel"
            ?disabled="${!this.crt}"
          >
            <md-icon slot="icon">mindfulness</md-icon>
            ${this.t("Logic Validation")}
          </md-primary-tab>
        </md-tabs>

        <div
          ?hidden="${this.activeTabIndex !== 0}"
          id="configure-panel"
          role="tabpanel"
          aria-labelledby="configure-tab"
        >
          ${this.renderConfiguration()}
        </div>

        <div
          id="crt-panel"
          role="tabpanel"
          aria-labelledby="crt-tab"
          ?hidden="${this.activeTabIndex !== 1}"
        >
          <ltp-current-reality-tree
            .crtData="${this.crt}"
          ></ltp-current-reality-tree>
        </div>
      `);
        }
    }
};
__decorate([
    property({ type: String })
], LtpManageCrt.prototype, "currentTreeId", void 0);
__decorate([
    property({ type: Object })
], LtpManageCrt.prototype, "crt", void 0);
__decorate([
    property({ type: Boolean })
], LtpManageCrt.prototype, "isCreatingCrt", void 0);
__decorate([
    property({ type: Boolean })
], LtpManageCrt.prototype, "isFetchingCrt", void 0);
__decorate([
    property({ type: Object })
], LtpManageCrt.prototype, "nodeToEditInfo", void 0);
__decorate([
    property({ type: Object })
], LtpManageCrt.prototype, "nodeToEdit", void 0);
__decorate([
    property({ type: Array })
], LtpManageCrt.prototype, "allCausesExceptCurrentToEdit", void 0);
__decorate([
    property({ type: Boolean })
], LtpManageCrt.prototype, "showDeleteConfirmation", void 0);
__decorate([
    property({ type: Number })
], LtpManageCrt.prototype, "activeTabIndex", void 0);
__decorate([
    property({ type: String })
], LtpManageCrt.prototype, "currentlySelectedCauseIdToAddAsChild", void 0);
__decorate([
    property({ type: String })
], LtpManageCrt.prototype, "AIConfigReview", void 0);
__decorate([
    property({ type: Boolean })
], LtpManageCrt.prototype, "isReviewingCrt", void 0);
__decorate([
    query("ltp-current-reality-tree")
], LtpManageCrt.prototype, "crtElement", void 0);
__decorate([
    property({ type: Object })
], LtpManageCrt.prototype, "nodeToAddCauseTo", void 0);
LtpManageCrt = __decorate([
    customElement("ltp-manage-crt")
], LtpManageCrt);
export { LtpManageCrt };
//# sourceMappingURL=ltp-manage-crt.js.map