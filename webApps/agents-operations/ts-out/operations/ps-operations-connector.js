var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import { LtpServerApi } from "./OpsServerApi.js";
import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element.js";
let PsPlaygroundConnector = class PsPlaygroundConnector extends YpBaseElement {
    constructor() {
        super();
        this.isCreatingCauses = false;
        this.api = new LtpServerApi();
    }
    async connectedCallback() {
        super.connectedCallback();
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    static get styles() {
        return [
            super.styles,
            css `
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
        const menu = this.shadowRoot?.getElementById("menu");
        menu.open = !menu.open;
    }
    render() {
        return html `
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
};
__decorate([
    property({ type: String })
], PsPlaygroundConnector.prototype, "nodeId", void 0);
__decorate([
    property({ type: String })
], PsPlaygroundConnector.prototype, "crtNodeType", void 0);
__decorate([
    property({ type: String })
], PsPlaygroundConnector.prototype, "crtId", void 0);
__decorate([
    property({ type: Boolean })
], PsPlaygroundConnector.prototype, "isCreatingCauses", void 0);
PsPlaygroundConnector = __decorate([
    customElement("ps-playground-connector")
], PsPlaygroundConnector);
export { PsPlaygroundConnector };
//# sourceMappingURL=ps-operations-connector.js.map