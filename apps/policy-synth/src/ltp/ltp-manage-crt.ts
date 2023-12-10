import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { cache } from 'lit/directives/cache.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import '@material/web/button/filled-button.js';

import { MdTabs } from '@material/web/tabs/tabs.js';

import { CpsStageBase } from '../cps-stage-base.js';

import './ltp-current-reality-tree.js';
import './LtpServerApi.js';
import { LtpServerApi } from './LtpServerApi.js';

const TESTING = true;

@customElement('ltp-manage-crt')
export class LtpManageCrt extends CpsStageBase {
  @property({ type: Object })
  crt: LtpCurrentRealityTreeData | undefined;

  @property({ type: Boolean })
  isCreatingCrt = false;

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

        md-filled-button {
          margin-top: 12px;
        }

        .crtUDEDescription {
          font-size: 16px;
          margin: 16px;
          margin-bottom: 0;
          padding: 16px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        md-tabs, crt-tab, configure-tab {
          width: 1920px;
        }
      `,
    ];
  }

  tabChanged() {
    this.activeTabIndex = (this.$$('#tabBar') as MdTabs).activeTabIndex;
  }

  async createTree() {
    this.isCreatingCrt = true;

    const crtSeed: LtpCurrentRealityTreeData = {
      description: (this.$$('#description') as MdOutlinedTextField)?.value ?? '',
      context: (this.$$('#context') as MdOutlinedTextField).value ?? '',
      rawPossibleCauses:
        (this.$$('#rawPossibleCauses') as MdOutlinedTextField).value ?? '',
      undesirableEffects:
        (this.$$('#undesirableEffects') as MdOutlinedTextField).value.split(
          '\n'
        ) ?? [],
      nodes: [],
    };

    if (TESTING) {
      crtSeed.context = 'We are a software company with a product we have as as service';
      crtSeed.undesirableEffects = ['End users are unhappy with the service'];
      crtSeed.rawPossibleCauses = `
        Incidents take a long time to resolve.
        There are lots of repeated incidents.
        `;
    }

    crtSeed.nodes = await this.api.createTree(crtSeed);

    this.crt = crtSeed;

    this.isCreatingCrt = false;
    this.activeTabIndex = 1;
  }

  renderConfiguration() {
    return html`
      <div class="layout vertical center-center">
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

          <div>
            <md-outlined-text-field
              type="textarea"
              label="Raw Possible Causes"
              id="rawPossibleCauses"
            ></md-outlined-text-field>
          </div>


          ${!this.crt
            ? html`
                <div class="layout horizontal center-center">
                  ${this.isCreatingCrt
                    ? html`
                        <md-circular-progress
                          indeterminate
                        ></md-circular-progress>
                      `
                    : html`
                        <md-filled-button @click="${this.createTree}"
                          >${this.t('Create CRT')}<md-icon slot="icon"
                            >send</md-icon
                          ></md-filled-button
                        >
                      `}
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <md-tabs id="tabBar" @change="${this.tabChanged}">
        <md-primary-tab id="configure-tab" aria-controls="configure-panel">
          <md-icon slot="icon">psychology</md-icon>
          ${this.t('Configuration')}
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
              <div class="layout vertical center-center">
                <div class="crtUDEDescription">${this.crt?.undesirableEffects[0]}</div>
              </div>
              <ltp-current-reality-tree
                .crtData="${this.crt}"
              ></ltp-current-reality-tree>
            </div>
          `)}
    `;
  }
}
