import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsView } from './ps-operations-view.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';

@customElement('ps-agent-node')
export abstract class PsAgentNode extends PsOperationsBaseNode {
  @property({ type: Object })
  agent!: PsAgentInstance;

  @property({ type: Boolean })
  isWorking = false;

  api: OpsServerApi;

  constructor() {
    super();
    this.api = new OpsServerApi();
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

    const nodes = await this.api.createDirectCauses(this.agent.id, this.nodeId);

    this.fireGlobal('add-nodes', {
      parentNodeId: this.nodeId,
      nodes,
    });


  }

  editNode() {
    this.fire('edit-node', {
      nodeId: this.nodeId,
      element: this,
    });
  }


  toggleMenu() {
    const menu = this.shadowRoot?.getElementById('menu') as MdMenu;
    menu.open = !menu.open;
  }


  override render() {
    return html`
      <div
        class="layout vertical mainContainer"

      >
        <div class="layout horizontal causeTextContainer">
          <div
            class="causeText"

          >
            ${this.agent.class.description}
          </div>
        </div>

        <md-icon class="typeIconCore ${this.agent.class.iconName}"
          >${this.agent.class.iconName}</md-icon
        >

        <md-icon-button

          class="editButton"
          @click="${this.editNode}"
          ><md-icon>edit</md-icon></md-icon-button
        >

        <div
          class="layout horizontal center-justify createOptionsButtons"

        >
          ${this.isWorking
            ? html`
                <md-circular-progress indeterminate></md-circular-progress>
              `
            : html`
                <md-icon-button

                  class="createOptionsButton"

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
