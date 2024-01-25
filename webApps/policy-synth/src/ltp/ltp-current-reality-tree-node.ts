import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import { LtpServerApi } from './LtpServerApi.js';
import { LtpCurrentRealityTree } from './ltp-current-reality-tree.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

@customElement('ltp-current-reality-tree-node')
export class LtpCurrentRealityTreeNode extends YpBaseElement {
  @property({ type: String })
  nodeId!: string;

  @property({ type: String })
  crtNodeType!: CrtNodeType;

  @property({ type: String })
  crtId!: string;

  @property({ type: Boolean })
  isRootCause = false;

  @property({ type: String })
  causeDescription!: string;

  @property({ type: Boolean })
  isCreatingCauses = false;

  api: LtpServerApi;

  constructor() {
    super();
    this.api = new LtpServerApi();
  }

  override async connectedCallback() {
    super.connectedCallback();
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .causeText {
          font-size: 14px;
          padding: 8px;
          height: 100%;
          width: 100%;
          max-height: 70px;
          overflow-y: auto;
        }

        .causeText[is-ude] {
          max-height: 75px;
        }

        .causeTextContainer {
          height: 100%;
        }

        .causeText[root-cause] {
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

        .editButton {
          position: absolute;
          bottom: 0;
          right: 0;
          z-index: 1500;
        }

        .typeIconCore {
          position: absolute;
          bottom: 8px;
          left: 8px;
        }

        .typeIcon {
          color: var(--md-sys-color-primary);
        }

        .typeIconUde {
          color: var(--md-sys-color-tertiary);
        }

        .typeIconRoot {
          color: var(--md-sys-color-on-primary);
        }

        md-icon-button[root-cause] {
          --md-icon-button-icon-color: var(--md-sys-color-on-primary);
        }

        md-circular-progress {
          --md-circular-progress-size: 28px;
          margin-bottom: 6px;
        }

        md-menu {
          --md-menu-z-index: 1000;
          z-index: 1000;
        }

        [hidden] {
          display: none !important;
        }
      `,
    ];
  }

  async createDirectCauses() {
    this.isCreatingCauses = true;

    const nodes = await this.api.createDirectCauses(this.crtId, this.nodeId);

    this.fireGlobal('add-nodes', {
      parentNodeId: this.nodeId,
      nodes,
    });

    this.isCreatingCauses = false;
  }

  editNode() {
    this.fire('edit-node', {
      nodeId: this.nodeId,
      element: this,
    });
  }

  get crtTypeIconClass() {
    switch (this.crtNodeType) {
      case 'ude':
        return 'typeIconUde';
      case 'rootCause':
        return 'typeIconRoot';
      default:
        console.log('crtNodeType', this.crtNodeType);
        return 'typeIcon';
    }
  }

  toggleMenu() {
    const menu = this.shadowRoot?.getElementById('menu') as MdMenu;
    menu.open = !menu.open;
  }

  get crtTypeIcon() {
    if (this.isRootCause) {
      return 'flag';
    } else {
      switch (this.crtNodeType) {
        case 'ude':
          return 'bug_report';
        case 'directCause':
          return 'arrow_upward';
        case 'intermediateCause':
          return 'link';
        case 'rootCause':
          return 'flag';
        case 'assumption':
          return 'question_mark';
        default:
          return 'more_vert';
      }
    }
  }

  override render() {
    return html`
      <div
        class="layout vertical mainContainer"
        ?root-cause="${this.isRootCause}"
      >
        <div class="layout horizontal causeTextContainer">
          <div
            class="causeText"
            ?is-ude="${this.crtNodeType === 'ude'}"
            ?root-cause="${this.isRootCause}"
          >
            ${this.causeDescription}
          </div>
        </div>

        <md-icon class="typeIconCore ${this.crtTypeIconClass}"
          >${this.crtTypeIcon}</md-icon
        >

        <md-icon-button
          ?root-cause="${this.isRootCause}"
          class="editButton"
          @click="${this.editNode}"
          ><md-icon>edit</md-icon></md-icon-button
        >

        <div
          class="layout horizontal center-justify createOptionsButtons"
          ?root-cause="${this.isRootCause}"
        >
          ${this.isCreatingCauses
            ? html`
                <md-circular-progress indeterminate></md-circular-progress>
              `
            : html`
                <md-icon-button
                  ?root-cause="${this.isRootCause}"
                  class="createOptionsButton"
                  ?hidden="${this.crtNodeType === 'rootCause'}"
                  @click="${() =>
                    this.fire('open-add-cause-dialog', {
                      parentNodeId: this.nodeId,
                    })}"
                  ><md-icon>add</md-icon></md-icon-button
                >
              `}
        </div>
      </div>
    `;
  }
}
