import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';

import { CpsStageBase } from '../cps-stage-base.js';

@customElement('ltp-current-reality-tree-node')
export class LtpCurrentRealityTreeNode extends CpsStageBase {
  @property({ type: String })
  nodeId: string;

  @property({ type: String })
  causeDescription: string;

  @property({ type: Boolean })
  isCreatingCauses = false;

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

  createDirectCauses() {
    this.isCreatingCauses = true;
    setTimeout(() => {
      this.isCreatingCauses = false;
    }, 3000);
  }

  render() {
    return html`
      <div class="layout vertical">
        <div class="layout horizontal">
          <div class="causeText">${this.causeDescription}</div>
        </div>
        <md-icon-button class="deleteButton"><md-icon>delete</md-icon></md-icon-button>
        <div class="layout horizontal center-justify createOptionsButtons">
          ${this.isCreatingCauses ? html`
          <md-circular-progress indeterminate></md-circular-progress>
          `: html`
            <md-icon-button class="createOptionsButton" @click="${this.createDirectCauses}"><md-icon>format_list_bulleted_add</md-icon></md-icon-button>
            <md-icon-button class="createOptionsButton"><md-icon>add_circle</md-icon></md-icon-button>
          `}
        </div>
      </div>
    `;
  }
}
