var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
let PsAgentNode = class PsAgentNode extends PsOperationsBaseNode {
    constructor() {
        super();
        this.isWorking = false;
        this.api = new OpsServerApi();
    }
    static get styles() {
        return [
            super.styles,
            css `
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
        const menu = this.shadowRoot?.getElementById('menu');
        menu.open = !menu.open;
    }
    render() {
        return html `
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
            ? html `
                <md-circular-progress indeterminate></md-circular-progress>
              `
            : html `
                <md-icon-button

                  class="createOptionsButton"

                  @click="${() => this.fire('open-add-cause-dialog', {
                parentNodeId: this.nodeId,
            })}"
                  ><md-icon>add</md-icon></md-icon-button
                >
              `}
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], PsAgentNode.prototype, "agent", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentNode.prototype, "isWorking", void 0);
PsAgentNode = __decorate([
    customElement('ps-agent-node')
], PsAgentNode);
export { PsAgentNode };
//# sourceMappingURL=ps-agent-node.js.map