import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';
import { PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/outlined-icon-button.js';

@customElement('ps-ai-model-selector')
export class PsAiModelSelector extends YpBaseElement {
  @property({ type: Array }) activeAiModels: PsAiModelAttributes[] = [];
  @property({ type: Array }) requestedAiModelSizes: PsAiModelSize[] = [];
  @property({ type: Object }) currentModels: {
    [key in PsAiModelSize]?: PsAiModelAttributes;
  } = {};

  @state() private selectedAiModels: {
    [key in PsAiModelSize]?: number | null;
  } = {};
  @state() private filteredAiModels: {
    [key in PsAiModelSize]: PsAiModelAttributes[];
  } = {
    small: [],
    medium: [],
    large: [],
  };

  updated(changedProperties: Map<string, any>) {
    if (
      changedProperties.has('activeAiModels') ||
      changedProperties.has('requestedAiModelSizes')
    ) {
      this.filterAiModels();
    }
    if (changedProperties.has('currentModels')) {
      this.initializeSelectedModels();
    }
  }

  filterAiModels() {
    this.filteredAiModels = {
      small: [],
      medium: [],
      large: [],
    };

    this.activeAiModels.forEach(model => {
      if (model.configuration && 'modelSize' in model.configuration) {
        const size = model.configuration.modelSize as PsAiModelSize;
        if (
          size in this.filteredAiModels &&
          this.requestedAiModelSizes.includes(size)
        ) {
          this.filteredAiModels[size].push(model);
        }
      }
    });
  }

  initializeSelectedModels() {
    this.selectedAiModels = {};
    Object.entries(this.currentModels).forEach(([size, model]) => {
      this.selectedAiModels[size as PsAiModelSize] = model.id;
    });
  }

  render() {
    return html`
      <div class="ai-model-selectors">
        ${this.requestedAiModelSizes.map(size =>
          this.renderAiModelSelect(size)
        )}
      </div>
    `;
  }

  private renderAiModelSelect(size: PsAiModelSize) {
    const models = this.filteredAiModels[size];
    const isDisabled = models.length === 0;
    const currentModel = this.currentModels[size];

    return html`
      <div class="ai-model-select-container">
        <md-filled-select
          .label="${this.getLocalizedModelLabel(size)}"
          @change="${(e: Event) => this._handleAiModelSelection(e, size)}"
          ?disabled="${isDisabled}"
        >
          ${isDisabled
            ? html`<md-select-option disabled>
                <div slot="headline">${this.t('noModelsAvailable')}</div>
              </md-select-option>`
            : models.map(
                aiModel => html`
                  <md-select-option
                    value="${aiModel.id}"
                    ?selected="${aiModel.id === currentModel?.id}"
                  >
                    <div slot="headline">${aiModel.name}</div>
                  </md-select-option>
                `
              )}
        </md-filled-select>
        ${currentModel
          ? html`
              <md-outlined-icon-button
                @click="${() => this._handleRemoveModel(size)}"
              >
                <md-icon>delete</md-icon>
              </md-outlined-icon-button>
            `
          : ''}
      </div>
    `;
  }

  private getLocalizedModelLabel(size: PsAiModelSize) {
    switch (size) {
      case 'small':
        return this.t('selectSmallAiModel');
      case 'medium':
        return this.t('selectMediumAiModel');
      case 'large':
        return this.t('selectLargeAiModel');
      default:
        return this.t('selectAiModel');
    }
  }

  private _handleAiModelSelection(e: Event, size: PsAiModelSize) {
    const select = e.target as HTMLSelectElement;
    this.selectedAiModels[size] = Number(select.value);
    this._emitChangeEvent();
  }

  private _handleRemoveModel(size: PsAiModelSize) {
    this.selectedAiModels[size] = null;
    this._emitChangeEvent();
  }

  private _emitChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('ai-models-changed', {
        detail: { selectedAiModels: this.selectedAiModels },
        bubbles: true,
        composed: true,
      })
    );
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .ai-model-selectors {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ai-model-select-container {
          display: flex;
          align-items: center;
        }

        md-filled-select {
          flex-grow: 1;
          margin-right: 8px;
        }

        md-outlined-icon-button {
          --md-sys-color-on-surface-variant: var(--md-sys-color-error);
        }
      `,
    ];
  }
}
