import { PropertyValueMap, css, html, nothing } from "lit";
import { property, customElement } from "lit/decorators.js";

import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";

import { MdMenu } from "@material/web/menu/menu.js";
import { PsOperationsBaseNode } from "./ps-operations-base-node.js";

@customElement("ps-connector-node")
export class PsAgentConnector extends PsOperationsBaseNode {
  @property({ type: Object })
  connector: PsAgentConnectorInstance;

  @property({ type: Number })
  connectorId!: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.connector = window.psAppGlobals.getConnectorInstance(this.connectorId);
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .connectorType {
          font-size: 15px;
          text-transform: uppercase;
          padding: 8px;
          padding-top: 8px;
          margin-left: 10px;
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
      `,
    ];
  }

  editNode() {
    this.fire("edit-node", {
      nodeId: this.nodeId,
      element: this,
    });
  }

  toggleMenu() {
    const menu = this.shadowRoot?.getElementById("menu") as MdMenu;
    menu.open = !menu.open;
  }

  override render() {
    return html`
      <div class="layout horizontal mainContainer">
        <div class="layout horizontal center-center">
          <div class="causeType">${this.connector.class.name}</div>
        </div>

        <md-icon-button class="editButton" @click="${this.editNode}"
          ><md-icon>edit</md-icon></md-icon-button
        >
      </div>
    `;
  }
}
