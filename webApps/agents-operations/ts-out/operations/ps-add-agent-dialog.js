var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';
import { OpsServerApi } from './OpsServerApi.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
let PsAddAgentDialog = class PsAddAgentDialog extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.open = false;
        this.activeAgentClasses = [];
        this.activeAiModels = [];
        this.selectedAgentClassId = null;
        this.selectedAiModelId = null;
        this.agentName = '';
        this.api = new OpsServerApi();
    }
    async connectedCallback() {
        super.connectedCallback();
        await this.fetchActiveAgentClasses();
        await this.fetchActiveAiModels();
    }
    async fetchActiveAgentClasses() {
        try {
            this.activeAgentClasses = await this.api.getActiveAgentClasses();
        }
        catch (error) {
            console.error('Error fetching active agent classes:', error);
        }
    }
    async fetchActiveAiModels() {
        try {
            this.activeAiModels = await this.api.getActiveAiModels();
        }
        catch (error) {
            console.error('Error fetching active AI models:', error);
        }
    }
    render() {
        return html `
      <md-dialog ?open="${this.open}" @closed="${this._handleClose}">
        <div slot="headline">Add New Agent</div>
        <div slot="content">
          <md-filled-text-field
            label="Agent Name"
            @input="${this._handleNameInput}"
            value="${this.agentName}"
          ></md-filled-text-field>
          <md-filled-select
            label="Select Agent Class"
            @change="${this._handleAgentClassSelection}"
          >
            ${this.activeAgentClasses.map(agentClass => html `
                <md-select-option value="${agentClass.id}">
                  <div slot="headline">${agentClass.name}</div>
                </md-select-option>
              `)}
          </md-filled-select>
          <md-filled-select
            label="Select AI Model"
            @change="${this._handleAiModelSelection}"
          >
            ${this.activeAiModels.map(aiModel => html `
                <md-select-option value="${aiModel.id}">
                  <div slot="headline">${aiModel.name}</div>
                </md-select-option>
              `)}
          </md-filled-select>
        </div>
        <div slot="actions">
          <md-text-button @click="${this._handleClose}">Cancel</md-text-button>
          <md-filled-button @click="${this._handleAddAgent}"
            >Add Agent</md-filled-button
          >
        </div>
      </md-dialog>
    `;
    }
    _handleNameInput(e) {
        const input = e.target;
        this.agentName = input.value;
    }
    _handleAgentClassSelection(e) {
        const select = e.target;
        this.selectedAgentClassId = Number(select.value);
    }
    _handleAiModelSelection(e) {
        const select = e.target;
        this.selectedAiModelId = Number(select.value);
    }
    _handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
    async _handleAddAgent() {
        if (!this.agentName ||
            !this.selectedAgentClassId ||
            !this.selectedAiModelId) {
            console.error('Agent name, class, or AI model not selected');
            return;
        }
        debugger;
        try {
            const newAgent = await this.api.createAgent(this.agentName, this.selectedAgentClassId, this.selectedAiModelId, this.parentAgentId, this.groupId);
            this.dispatchEvent(new CustomEvent('agent-added', { detail: { agent: newAgent } }));
            this._handleClose();
        }
        catch (error) {
            console.error('Error creating new agent:', error);
        }
    }
    static get styles() {
        return [
            super.styles,
            css `
        md-filled-text-field,
        md-filled-select {
          width: 100%;
          margin-bottom: 16px;
        }
      `,
        ];
    }
};
__decorate([
    property({ type: Boolean })
], PsAddAgentDialog.prototype, "open", void 0);
__decorate([
    property({ type: Number })
], PsAddAgentDialog.prototype, "parentAgentId", void 0);
__decorate([
    property({ type: Number })
], PsAddAgentDialog.prototype, "groupId", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "activeAgentClasses", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "activeAiModels", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "selectedAgentClassId", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "selectedAiModelId", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "agentName", void 0);
PsAddAgentDialog = __decorate([
    customElement('ps-add-agent-dialog')
], PsAddAgentDialog);
export { PsAddAgentDialog };
//# sourceMappingURL=ps-add-agent-dialog.js.map