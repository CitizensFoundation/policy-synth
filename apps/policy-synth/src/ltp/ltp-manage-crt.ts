import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { cache } from 'lit/directives/cache.js';
import { resolveMarkdown } from './chat/litMarkdown.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/dialog/dialog.js';

import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import '@material/web/button/filled-button.js';

import { MdTabs } from '@material/web/tabs/tabs.js';

import { CpsStageBase } from '../cps-stage-base.js';

import './ltp-current-reality-tree.js';
import './LtpServerApi.js';
import { LtpServerApi } from './LtpServerApi.js';

import './chat/ltp-chat-assistant.js';
import { MdDialog } from '@material/web/dialog/dialog.js';
import { LtpStreamingAIResponse } from './LtpStreamingAIResponse.js';

const TESTING = false;

@customElement('ltp-manage-crt')
export class LtpManageCrt extends CpsStageBase {
  @property({ type: String })
  currentTreeId: string | undefined;

  @property({ type: Object })
  crt: LtpCurrentRealityTreeData | undefined;

  @property({ type: Boolean })
  isCreatingCrt = false;

  @property({ type: Boolean })
  isFetchingCrt = false;

  @property({ type: Number })
  activeTabIndex = 0;

  @property({ type: String })
  AIConfigReview: string | undefined;

  @property({ type: Boolean })
  isReviewingCrt = false;

  api: LtpServerApi;

  @property({ type: Object })
  nodeToAddCauseTo: LtpCurrentRealityTreeDataNode | undefined;
  wsMessageListener: (event: any) => void;
  currentStreaminReponse: LtpStreamingAIResponse;

  constructor() {
    super();
    this.api = new LtpServerApi();
  }

  async connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'open-add-cause-dialog',
      this.openAddCauseDialog as EventListenerOrEventListenerObject
    );

    this.addEventListener(
      'close-add-cause-dialog',
      this.closeAddCauseDialog as EventListenerOrEventListenerObject
    );

    if (this.currentTreeId) {
      this.fetchCurrentTree();
    }
  }

  updatePath() {
    if (this.crt && this.crt.id) {
      window.history.pushState({}, '', `/crt/${this.crt.id}`);
    } else {
      console.error('Could not fetch current tree: ' + this.currentTreeId);
    }
  }

  async fetchCurrentTree() {
    this.isFetchingCrt = true;

    this.crt = await this.api.getCrt(this.currentTreeId);

    this.isFetchingCrt = false;

    this.updatePath();

    await this.updateComplete;

    (this.$$('#context') as MdOutlinedTextField).value = this.crt.context;
    (this.$$('#undesirableEffects') as MdOutlinedTextField).value =
      this.crt.undesirableEffects.join('\n');

    this.activeTabIndex = 1;
    (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
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
    this.crt = undefined;
    this.currentTreeId = undefined;
    this.AIConfigReview = undefined;
    (this.$$('#context') as MdOutlinedTextField).value = '';
    (this.$$('#undesirableEffects') as MdOutlinedTextField).value = '';
    window.history.pushState({}, '', `/crt`);
  }

  get crtInputData() {
    return {
      description:
        (this.$$('#description') as MdOutlinedTextField)?.value ?? '',
      context: (this.$$('#context') as MdOutlinedTextField).value ?? '',
      undesirableEffects:
        (this.$$('#undesirableEffects') as MdOutlinedTextField).value.split(
          '\n'
        ) ?? [],
      nodes: [],
    } as LtpCurrentRealityTreeData;
  }

  async reviewTreeConfiguration() {
    this.isReviewingCrt = true;

    if (this.currentStreaminReponse) {
      this.currentStreaminReponse.close();
    }

    if (this.wsMessageListener) {
      this.removeEventListener('wsMessage', this.wsMessageListener);
    }

    this.AIConfigReview = undefined;

    this.currentStreaminReponse = new LtpStreamingAIResponse(this);

    try {
      const wsClientId = await this.currentStreaminReponse.connect();
      this.AIConfigReview = '';
      console.log('Connected with clientId:', wsClientId);

      this.wsMessageListener = (event: any) => {
        const { data } = event.detail;
        if (data.type === 'part' && data.text) {
          this.AIConfigReview += data.text;
        } else if (data.type === 'end') {
          this.removeEventListener('wsMessage', this.wsMessageListener);
          this.wsMessageListener = undefined;
          this.currentStreaminReponse  = undefined;
          this.isReviewingCrt = false;
        }
      };

      this.addEventListener('wsMessage', this.wsMessageListener);

      await this.api.reviewConfiguration(wsClientId, this.crtInputData);

      // Proceed with your logic
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.removeEventListener('wsMessage', this.wsMessageListener);
    }
  }

  async createTree() {
    this.isCreatingCrt = true;

    const crtSeed = this.crtInputData;

    if (TESTING && (this.$$('#context') as MdOutlinedTextField).value == '') {
      crtSeed.context =
        'We are a software company with a product we have as as service';
      crtSeed.undesirableEffects = ['End users are unhappy with the service'];
    }

    this.crt = await this.api.createTree(crtSeed);
    this.currentTreeId = this.crt.id;
    this.updatePath();

    this.isCreatingCrt = false;
    this.activeTabIndex = 1;
    (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
  }

  toggleDarkMode() {
    this.fire('yp-theme-dark-mode', !this.themeDarkMode);
    window.appGlobals.activity('Crt - toggle darkmode');
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
          @click="${this.reviewTreeConfiguration}"
          ?hidden="${!this.AIConfigReview || this.crt!=undefined}"
          >${this.t('Review CRT again')}<md-icon slot="icon"
            >rate_review</md-icon
          ></md-outlined-button
        >
        <md-filled-button
          @click="${this.reviewTreeConfiguration}"
          ?hidden="${this.AIConfigReview!=undefined || this.crt!=undefined}"
          ?disabled="${this.isReviewingCrt}"
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
              ?hidden="${!this.crt}"
              >${this.t('Create New Tree')}<md-icon slot="icon"
                >rate_review</md-icon
              ></md-outlined-button
            >

            ${this.renderReviewAndSubmit()}

            <md-filled-button
              @click="${this.createTree}"
              ?hidden="${!this.AIConfigReview || this.crt!=undefined}"
              ?disabled="${this.isReviewingCrt}"
              >${this.t('Create CRT')}<md-icon slot="icon"
                >send</md-icon
              ></md-filled-button
            >
          </div>

          ${(this.isReviewingCrt && !this.AIConfigReview)
            ? html`<md-linear-progress indeterminate></md-linear-progress>`
            : nothing}
          ${this.AIConfigReview ? this.renderAIConfigReview() : nothing}
        </div>
      </div>
    `;
  }

  openAddCauseDialog(event: CustomEvent) {
    console.error(`openAddCauseDialog ${event.detail.parentNodeId}`);
    const parentNodeId = event.detail.parentNodeId;
    // Get the node from the tree recursively
    const findNodeRecursively = (
      nodes: LtpCurrentRealityTreeDataNode[],
      nodeId: string
    ): LtpCurrentRealityTreeDataNode | undefined => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node;
        }
        if (node.andChildren) {
          const foundNode = findNodeRecursively(node.andChildren, nodeId);
          if (foundNode) {
            return foundNode;
          }
        }
        if (node.orChildren) {
          const foundNode = findNodeRecursively(node.orChildren, nodeId);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return undefined;
    };

    // Find the node recursively
    const node = findNodeRecursively(this.crt?.nodes || [], parentNodeId);
    if (!node) {
      console.error(`Could not find node ${parentNodeId}`);
      console.error(JSON.stringify(this.crt, null, 2));
      return;
    }
    this.nodeToAddCauseTo = node;
    (this.$$('#addCauseDialog') as MdDialog).show();
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
        <div slot="headline">${this.nodeToAddCauseTo?.description}</div>
        <div slot="content" class="chatContainer">
          ${this.nodeToAddCauseTo
            ? html`
                <ltp-chat-assistant
                  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
                  method="dialog"
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
      html`<md-linear-progress indeterminate></md-linear-progress>`;
    } else {
      return cache(html`
        ${this.renderAddCauseDialog()}
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
          <md-primary-tab
            id="crt-tab"
            aria-controls="crt-panel"
            ?disabled="${!this.crt}"
          >
            <md-icon slot="icon">mindfulness</md-icon>
            ${this.t('Logic Validation')}
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
}
