var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
let PsAgentNode = class PsAgentNode extends PsOperationsBaseNode {
    constructor() {
        super();
        this.isWorking = false;
        this.latestMessage = '';
        this.api = new OpsServerApi();
    }
    connectedCallback() {
        super.connectedCallback();
        this.agent = window.psAppGlobals.getAgentInstance(this.agentId);
        this.startStatusUpdates();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopStatusUpdates();
    }
    startStatusUpdates() {
        this.updateAgentStatus();
        this.statusInterval = window.setInterval(() => this.updateAgentStatus(), 5000);
    }
    stopStatusUpdates() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
    }
    async updateAgentStatus() {
        try {
            const status = await this.api.getAgentStatus(this.agent.id);
            if (status) {
                this.isWorking = status.state === 'running';
                this.progress = status.progress;
                this.latestMessage = status.messages[status.messages.length - 1] || '';
                this.requestUpdate();
            }
        }
        catch (error) {
            console.error('Failed to get agent status:', error);
        }
    }
    static get styles() {
        return [
            super.styles,
            css `
        :host {
          display: block;
        }

        md-linear-progress {
          margin: 16px;
          margin-bottom: 8px;
        }

        .mainContainer {
          height: 320px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .image {
          width: 100%;
          height: 113px;
          object-fit: cover;
          border-radius: 16px 16px 0 0;
        }

        .contentContainer {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 8px;
        }

        .agentClassName {
          font-size: 16px;
          text-align: center;
          margin-bottom: 8px;
        }

        .agentName {
          font-size: 14px;
          text-align: center;
        }

        .statusMessage {
          font-size: 11px;
          text-align: center;
          margin-top: 8px;
          border-radius: 16px;
          flex-grow: 1;
          color: var(--md-sys-color-on-surface-variant);
        }

        .buttonContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }

        md-circular-progress {
          --md-circular-progress-size: 28px;
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
    async startAgent() {
        try {
            await this.api.startAgent(this.agent.id);
            this.isWorking = true;
            window.psAppGlobals.setCurrentRunningAgentId(this.agent.id);
            this.startStatusUpdates();
            this.requestUpdate();
        }
        catch (error) {
            console.error('Failed to start agent:', error);
        }
    }
    async pauseAgent() {
        try {
            await this.api.pauseAgent(this.agent.id);
            this.isWorking = false;
            window.psAppGlobals.setCurrentRunningAgentId(undefined);
            this.stopStatusUpdates();
            this.requestUpdate();
        }
        catch (error) {
            console.error('Failed to pause agent:', error);
        }
    }
    async stopAgent() {
        try {
            await this.api.stopAgent(this.agent.id);
            this.isWorking = false;
            window.psAppGlobals.setCurrentRunningAgentId(undefined);
            this.stopStatusUpdates();
            this.requestUpdate();
        }
        catch (error) {
            console.error('Failed to stop agent:', error);
        }
    }
    editNode() {
        this.fire('edit-node', {
            nodeId: this.nodeId,
            element: this.agent,
        });
    }
    toggleMenu() {
        const menu = this.shadowRoot?.getElementById('menu');
        menu.open = !menu.open;
    }
    clickPlayPause() {
        if (this.agent.id == this.currentRunningAgentId) {
            this.fireGlobal('pause-agent', {
                agentId: this.agent.id,
            });
            this.pauseAgent();
            window.psAppGlobals.setCurrentRunningAgentId(undefined);
        }
        else {
            this.startAgent();
            this.fireGlobal('run-agent', {
                agentId: this.agent.id,
            });
            window.psAppGlobals.setCurrentRunningAgentId(this.agent.id);
        }
        this.requestUpdate();
    }
    renderProgress() {
        if (this.progress === undefined) {
            return html `<md-linear-progress indeterminate></md-linear-progress>`;
        }
        else {
            const progress = Math.min(1, Math.max(0, this.progress / 100));
            return html `<md-linear-progress
          value="${progress}"
        ></md-linear-progress>`;
        }
    }
    render() {
        if (!this.agent)
            return nothing;
        if (this.agent.id == this.currentRunningAgentId) {
            this.parentElement.className = 'agentContainer agentContainerRunning';
        }
        else {
            this.parentElement.className = 'agentContainer';
        }
        return html `
      <div class="mainContainer">
        <img
          class="image"
          src="${this.agent.Class.configuration.imageUrl}"
          alt="${this.agent.Class.name}"
        />
        <div class="contentContainer">
          <div class="agentClassName">${this.agent.Class.name}</div>
          <div class="agentName">${this.agent.configuration['name']}</div>
          ${this.isWorking ? this.renderProgress() : nothing}
          <div class="statusMessage">${this.latestMessage}</div>
        </div>
        <div class="buttonContainer">
          <md-icon-button @click="${this.toggleMenu}">
            <md-icon>more_vert</md-icon>
          </md-icon-button>
          <md-icon-button
            ?disabled="${window.psAppGlobals.currentRunningAgentId &&
            this.agent.id != window.psAppGlobals.currentRunningAgentId}"
            @click="${this.clickPlayPause}"
          >
            <md-icon>
              ${this.agent.id == window.psAppGlobals.currentRunningAgentId
            ? 'pause'
            : 'play_arrow'}
            </md-icon>
          </md-icon-button>
          <md-icon-button @click="${this.editNode}">
            <md-icon>settings</md-icon>
          </md-icon-button>
        </div>
        <md-menu id="menu">
          <md-menu-item @click="${this.stopAgent}">Stop Agent</md-menu-item>
          <!-- Add more menu items as needed -->
        </md-menu>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], PsAgentNode.prototype, "agent", void 0);
__decorate([
    property({ type: Number })
], PsAgentNode.prototype, "agentId", void 0);
__decorate([
    property({ type: Boolean })
], PsAgentNode.prototype, "isWorking", void 0);
__decorate([
    state()
], PsAgentNode.prototype, "latestMessage", void 0);
__decorate([
    state()
], PsAgentNode.prototype, "progress", void 0);
PsAgentNode = __decorate([
    customElement('ps-agent-node')
], PsAgentNode);
export { PsAgentNode };
//# sourceMappingURL=ps-agent-node.js.map