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
        this.selectedAiModels = {};
        this.agentName = '';
        this.filteredAiModels = {
            small: [],
            medium: [],
            large: []
        };
        this.requestedAiModelSizes = [];
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
            this.filterAiModels();
        }
        catch (error) {
            console.error('Error fetching active AI models:', error);
        }
    }
    get hasAnyAiModels() {
        return Object.values(this.filteredAiModels).some(models => models.length > 0);
    }
    filterAiModels() {
        this.filteredAiModels = {
            small: [],
            medium: [],
            large: []
        };
        this.activeAiModels.forEach(model => {
            if (model.configuration && 'modelSize' in model.configuration) {
                const size = model.configuration.modelSize;
                if (size in this.filteredAiModels && this.requestedAiModelSizes.includes(size)) {
                    this.filteredAiModels[size].push(model);
                }
            }
        });
    }
    render() {
        return html `
      <md-dialog ?open="${this.open}" @closed="${this._handleClose}" @cancel="${this.disableScrim}">
        <div slot="headline">${this.t('addNewAgent')}</div>
        <div slot="content">
          <md-filled-text-field
            label="${this.t('agentName')}"
            @input="${this._handleNameInput}"
            value="${this.agentName}"
          ></md-filled-text-field>
          <md-filled-select
            label="${this.t('selectAgentClass')}"
            @change="${this._handleAgentClassSelection}"
          >
            ${this.activeAgentClasses?.map(agentClass => html `
                <md-select-option value="${agentClass.id}">
                  <div slot="headline">${agentClass.name}</div>
                </md-select-option>
              `)}
          </md-filled-select>
          <div class="aiModelInfo" ?hidden="${!this.hasAnyAiModels}">
            ${this.t("aiModelAgentCreateInfo")}
          </div>
          ${this.requestedAiModelSizes.map(size => this.renderAiModelSelect(size))}
        </div>
        <div slot="actions">
          <md-text-button @click="${this._handleClose}">${this.t('cancel')}</md-text-button>
          <md-filled-button @click="${this._handleAddAgent}">${this.t('addAgent')}</md-filled-button>
        </div>
      </md-dialog>
    `;
    }
    getLocalizedModelLabel(size) {
        switch (size) {
            case 'small':
                return this.t("selectSmallAiModel");
            case 'medium':
                return this.t("selectMediumAiModel");
            case 'large':
                return this.t("selectLargeAiModel");
            default:
                return this.t("selectAiModel");
        }
    }
    renderAiModelSelect(size) {
        const models = this.filteredAiModels[size];
        const isDisabled = models.length === 0;
        return html `
      <md-filled-select
        .label="${this.getLocalizedModelLabel(size)}"
        @change="${(e) => this._handleAiModelSelection(e, size)}"
        ?disabled="${isDisabled}"
      >
        ${isDisabled
            ? html `<md-select-option disabled>
              <div slot="headline">${this.t("noModelsAvailable")}</div>
            </md-select-option>`
            : models.map(aiModel => html `
              <md-select-option value="${aiModel.id}">
                <div slot="headline">${aiModel.name}</div>
              </md-select-option>
            `)}
      </md-filled-select>
    `;
    }
    _handleNameInput(e) {
        const input = e.target;
        this.agentName = input.value;
    }
    _handleAgentClassSelection(e) {
        const select = e.target;
        this.selectedAgentClassId = Number(select.value);
        // Update requestedAiModelSizes based on the selected agent class
        const selectedClass = this.activeAgentClasses.find(c => c.id === this.selectedAgentClassId);
        if (selectedClass && selectedClass.configuration && selectedClass.configuration.requestedAiModelSizes) {
            this.requestedAiModelSizes = selectedClass.configuration.requestedAiModelSizes;
        }
        else {
            this.requestedAiModelSizes = [];
        }
        // Re-filter AI models based on the new requested sizes
        this.filterAiModels();
    }
    _handleAiModelSelection(e, size) {
        const select = e.target;
        this.selectedAiModels[size] = Number(select.value);
    }
    _handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
    disableScrim(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    async _handleAddAgent() {
        const selectedModels = Object.entries(this.selectedAiModels)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        if (!this.agentName || !this.selectedAgentClassId || Object.keys(selectedModels).length === 0) {
            console.error('Agent name, class, and at least one AI model must be selected');
            return;
        }
        try {
            const newAgent = await this.api.createAgent(this.agentName, this.selectedAgentClassId, selectedModels, this.parentAgentId, this.groupId);
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
          margin-top: 16px;
        }

        .aiModelInfo {
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: var(--md-sys-typescale-label-medium-size);
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
], PsAddAgentDialog.prototype, "selectedAiModels", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "agentName", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "filteredAiModels", void 0);
__decorate([
    state()
], PsAddAgentDialog.prototype, "requestedAiModelSizes", void 0);
PsAddAgentDialog = __decorate([
    customElement('ps-add-agent-dialog')
], PsAddAgentDialog);
export { PsAddAgentDialog };
//# sourceMappingURL=ps-add-agent-dialog.js.map