import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';

import { OpsServerApi } from './OpsServerApi.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

@customElement('ps-add-agent-dialog')
export class PsAddAgentDialog extends YpBaseElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Number }) parentAgentId: number;
  @property({ type: Number }) groupId: number;

  @state() private activeAgentClasses: PsAgentClassAttributes[] = [];
  @state() private activeAiModels: PsAiModelAttributes[] = [];
  @state() private selectedAgentClassId: number | null = null;
  @state() private selectedAiModels: { [key: string]: number | null } = {
    small: null,
    medium: null,
    large: null
  };
  @state() private agentName: string = '';

  private api = new OpsServerApi();

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchActiveAgentClasses();
    await this.fetchActiveAiModels();
  }

  async fetchActiveAgentClasses() {
    try {
      this.activeAgentClasses = await this.api.getActiveAgentClasses();
    } catch (error) {
      console.error('Error fetching active agent classes:', error);
    }
  }

  async fetchActiveAiModels() {
    try {
      this.activeAiModels = await this.api.getActiveAiModels();
    } catch (error) {
      console.error('Error fetching active AI models:', error);
    }
  }

  render() {
    return html`
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
            ${this.activeAgentClasses?.map(
              agentClass => html`
                <md-select-option value="${agentClass.id}">
                  <div slot="headline">${agentClass.name}</div>
                </md-select-option>
              `
            )}
          </md-filled-select>
          <div class="aiModelInfo">
            ${this.t("aiModelAgentCreateInfo")}
          </div>
          ${['small', 'medium', 'large'].map(size => this.renderAiModelSelect(size))}
        </div>
        <div slot="actions">
          <md-text-button @click="${this._handleClose}">Cancel</md-text-button>
          <md-filled-button @click="${this._handleAddAgent}">Add Agent</md-filled-button>
        </div>
      </md-dialog>
    `;
  }

  getLocalizedModelLabel(size: string) {
    if (size==='small') {
      return this.t("selectSmallAiModel");
    } else if (size==='medium') {
      return this.t("selectMediumAiModel");
    } else if (size==='large') {
      return this.t("selectLargeAiModel");
    }
  }

  private renderAiModelSelect(size: string) {
    return html`
      <md-filled-select
        .label="${this.getLocalizedModelLabel(size)}"
        @change="${(e: Event) => this._handleAiModelSelection(e, size)}"
      >
        ${this.activeAiModels.map(
          aiModel => html`
            <md-select-option value="${aiModel.id}">
              <div slot="headline">${aiModel.name}</div>
            </md-select-option>
          `
        )}
      </md-filled-select>
    `;
  }

  private _handleNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.agentName = input.value;
  }

  private _handleAgentClassSelection(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selectedAgentClassId = Number(select.value);
  }

  private _handleAiModelSelection(e: Event, size: string) {
    const select = e.target as HTMLSelectElement;
    this.selectedAiModels[size] = Number(select.value);
  }

  private _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private async _handleAddAgent() {
    if (!this.agentName || !this.selectedAgentClassId ||
        !this.selectedAiModels.small || !this.selectedAiModels.medium || !this.selectedAiModels.large) {
      console.error('Agent name, class, or AI models not selected');
      return;
    }

    try {
      const newAgent = await this.api.createAgent(
        this.agentName,
        this.selectedAgentClassId,
        this.selectedAiModels,
        this.parentAgentId,
        this.groupId
      );
      this.dispatchEvent(
        new CustomEvent('agent-added', { detail: { agent: newAgent } })
      );
      this._handleClose();
    } catch (error) {
      console.error('Error creating new agent:', error);
    }
  }

  static override get styles() {
    return [
      super.styles,
      css`
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
}