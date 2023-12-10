import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';

import { CpsStageBase } from '../cps-stage-base.js';
import { LtpServerApi } from './LtpServerApi.js';
import { LtpCurrentRealityTree } from './ltp-current-reality-tree.js';

@customElement('ltp-current-reality-tree-node')
export class LtpCurrentRealityTreeNode extends CpsStageBase {
  @property({ type: String })
  nodeId: string;

  @property({ type: Boolean })
  isRootCause!: boolean;

  @property({ type: String })
  causeDescription: string;

  @property({ type: Boolean })
  isCreatingCauses = false;

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
          font-size: 14px;
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          padding: 8px;
          height: 100%;
          width: 100%;
        }

        .causeTextContainer {
          height: 100%;
        }


        .causeText[root-cause] {
          color: var(--md-sys-color-on-tertiary);
          background-color: var(--md-sys-color-tertiary);
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

        .createOptionsButtons[root-cause] {
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

  async createDirectCauses() {
    this.isCreatingCauses = true;

    const nodes = await this.api.createDirectCauses(this.nodeId);

    this.fire("add-nodes", {
      parentNodeId: this.nodeId,
      nodes
    });

    this.isCreatingCauses = false;
  }

  render() {
    return html`
      <div class="layout vertical mainContainer" ?root-cause="${this.isRootCause}">
        <div class="layout horizontal causeTextContainer">
          <div class="causeText" ?root-cause="${this.isRootCause}">${this.causeDescription}</div>
        </div>
        <md-icon-button class="deleteButton"
          ><md-icon>delete</md-icon></md-icon-button
        >
        <div class="layout horizontal center-justify createOptionsButtons" ?root-cause="${this.isRootCause}">
          ${this.isCreatingCauses
            ? html`
                <md-circular-progress indeterminate></md-circular-progress>
              `
            : html`
                <md-icon-button
                  class="createOptionsButton"
                  @click="${this.createDirectCauses}"
                  ><md-icon>format_list_bulleted_add</md-icon></md-icon-button
                >
                <md-icon-button class="createOptionsButton"
                  ><md-icon>add_circle</md-icon></md-icon-button
                >
              `}
        </div>
      </div>
    `;
  }
}
