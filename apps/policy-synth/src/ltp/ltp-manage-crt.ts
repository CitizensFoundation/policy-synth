import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { cache } from 'lit/directives/cache.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import { MdTabs } from '@material/web/tabs/tabs.js';

import { CpsStageBase } from '../cps-stage-base.js';

import './ltp-current-reality-tree.js';
import './LtpServerApi.js';
import { LtpServerApi } from './LtpServerApi.js';

@customElement('ltp-manage-crt')
export class LtpManageCrt extends CpsStageBase {
  @property({ type: Object })
  crt: LtpCurrentRealityTreeData | undefined;

  @property({ type: Boolean })
  isCreatingTree = false;

  @property({ type: Number })
  activeTabIndex = 0;

  api: LtpServerApi;

  constructor() {
    super();
    this.api = new LtpServerApi();
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  static get styles() {
    return [
      super.styles,
      css`
        .causeText {
          font-size: 12px;
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          padding: 8px;
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
          position: absolute;
          bottom: 0;
          left: 0;
        }

        md-circular-progress {
          --md-circular-progress-size: 28px;
          margin-bottom: 6px;
        }
      `,
    ];
  }

  tabChanged() {
    this.activeTabIndex = (this.$$('#tabBar') as MdTabs).activeTabIndex;
  }

  createTree() {
    this.crt = {
      description: (this.$$('#description') as MdOutlinedTextField).value ?? '',
      context: (this.$$('#context') as MdOutlinedTextField).value ?? '',
      rawPossibleCauses:
        (this.$$('#rawPossibleCauses') as MdOutlinedTextField).value ?? '',
      undesirableEffects:
        (this.$$('#undesirableEffects') as MdOutlinedTextField).value.split(
          '\n'
        ) ?? [],
      nodes: [],
    };

    this.api.createTree(this.crt).then(() => {
      this.activeTabIndex = 1;
    });
  }

  renderConfiguration() {
    return html`
      <div>
        <md-outlined-text-field
          label="Description"
          id="description"
          .value="${this.crt?.description}"
          @change="${(e: Event) =>
            (this.crt.description = (e.target as MdOutlinedTextField).value)}"
        ></md-outlined-text-field>
      </div>

      <div>
        <md-outlined-text-field
          label="Context"
          id="context"
          .value="${this.crt?.context}"
          @change="${(e: Event) =>
            (this.crt.context = (e.target as MdOutlinedTextField).value)}"
        ></md-outlined-text-field>
      </div>

      <div>
        <md-outlined-text-field
          label="Raw Possible Causes"
          id="rawPossibleCauses"
          .value="${this.crt?.rawPossibleCauses}"
          @change="${(e: Event) =>
            (this.crt.rawPossibleCauses = (
              e.target as MdOutlinedTextField
            ).value)}"
        ></md-outlined-text-field>
      </div>

      <div>
        <md-outlined-text-field
          label="Undesirable Effects"
          id="undesirableEffects"
          .value="${this.crt?.undesirableEffects.join('\n')}"
          @change="${(e: Event) =>
            (this.crt.undesirableEffects = (
              e.target as MdOutlinedTextField
            ).value.split('\n'))}"
        ></md-outlined-text-field>
      </div>

      ${!this.crt
        ? html`
            <md-filled-button @click="${this.createTree}"
              >${this.t('Create CRT')}<md-icon>send</md-icon></md-filled-button
            >
          `
        : nothing}
    `;
  }

  render() {
    return html`
      <md-tabs id="tabBar" @change="${this.tabChanged}">
        <md-primary-tab id="configure-tab" aria-controls="configure-panel">
          <md-icon slot="icon">psychology</md-icon>
          ${this.t('Configure')}
        </md-primary-tab>
        <md-primary-tab
          id="crt-tab"
          aria-controls="crt-panel"
          ?disabled="${!this.crt}"
        >
          <md-icon slot="icon">account_tree</md-icon>
          Current Reality Tree
        </md-primary-tab>
      </md-tabs>

      ${this.activeTabIndex === 0
        ? html`
            <div
              id="configure-panel"
              role="tabpanel"
              aria-labelledby="configure-tab"
            >
              ${this.renderConfiguration()}
            </div>
          `
        : cache(html`
            <div id="crt-panel" role="tabpanel" aria-labelledby="crt-tab">
              <ltp-current-reality-tree
                .crt="${this.crt}"
              ></ltp-current-reality-tree>
            </div>
          `)}
    `;
  }
}
