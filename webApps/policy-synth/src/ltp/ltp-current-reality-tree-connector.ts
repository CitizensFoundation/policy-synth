import { PropertyValueMap, css, html, nothing } from "lit";
import { property, customElement } from "lit/decorators.js";

import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";

import { LtpServerApi } from "./LtpServerApi.js";
import { LtpCurrentRealityTree } from "./ltp-current-reality-tree.js";
import { MdMenu } from "@material/web/menu/menu.js";
import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element.js";

@customElement("ltp-current-reality-tree-connector")
export class LtpCurrentRealityTreeConnector extends YpBaseElement {
  @property({ type: String })
  nodeId!: string;

  @property({ type: String })
  crtNodeType!: CrtNodeType;

  @property({ type: String })
  crtId!: string;

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

  override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.updated(changedProperties);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .causeType {
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
          <div class="causeType">${this.crtNodeType}</div>
        </div>

        <md-icon-button class="editButton" @click="${this.editNode}"
          ><md-icon>edit</md-icon></md-icon-button
        >
      </div>
    `;
  }
}
