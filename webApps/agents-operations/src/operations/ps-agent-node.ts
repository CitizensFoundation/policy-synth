import { css, html, nothing } from 'lit';
import { property, query, customElement, state } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
import { MdMenu } from '@material/web/menu/menu.js';

@customElement('ps-agent-node')
export class PsAgentNode extends PsOperationsBaseNode {
  @property({ type: Object })
  agent!: PsAgentAttributes;

  @property({ type: Number })
  agentId!: number;

  @property({ type: Boolean })
  isWorking = false;

  @state()
  private latestMessage: string = '';

  @state()
  private progress: number | undefined;

  @state()
  private menuOpen = false;

  @query('#menuAnchor')
  menuAnchor!: HTMLElement;

  @query('#agentMenu')
  agentMenu!: MdMenu;

  api: OpsServerApi;
  private statusInterval: number | undefined;

  constructor() {
    super();
    this.api = new OpsServerApi();
  }

  firstUpdated() {
    if (this.agentMenu && this.menuAnchor) {
      (this.agentMenu as MdMenu).anchorElement = this.menuAnchor;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.agent = window.psAppGlobals.getAgentInstance(this.agentId);
    this.startStatusUpdates();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopStatusUpdates();
  }

  toggleMenu(e: Event) {
    e.stopPropagation();
    if (this.agentMenu) {
      this.agentMenu.open = !this.agentMenu.open;
    }
  }

  addConnector() {
    this.fire('add-connector', { agentId: this.agent.id });
    this.menuOpen = false;
  }
  startStatusUpdates() {
    this.updateAgentStatus();
    this.statusInterval = window.setInterval(
      () => this.updateAgentStatus(),
      5000
    );
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
        if (this.latestMessage.indexOf('Agent completed') > -1) {
          this.isWorking = false;
          this.stopAgent();
          this.requestUpdate();
        }
        this.requestUpdate();
        this.fire('get-costs');
      }
    } catch (error) {
      console.error('Failed to get agent status:', error);
    }
  }

  static override get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }

        :host {
          display: block;
          position: relative;
        }

        .mainContainer {
          position: relative;
        }

        md-menu {
          --md-menu-container-color: var(--md-sys-color-surface-container);
          --md-menu-container-elevation: 2;
          z-index: 2000;
        }

        md-linear-progress {
          margin: 16px;
          margin-bottom: 8px;
          margin-top: 8px;
        }

        .mainContainer {
          height: 300px;
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
          font-size: 9px;
          text-align: center;
          margin: 8px;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  }

  editNode() {
    this.fire('edit-node', {
      nodeId: this.nodeId,
      element: this.agent,
    });
  }

  clickPlayPause() {
    if (this.agent.id == this.currentRunningAgentId) {
      this.fireGlobal('pause-agent', {
        agentId: this.agent.id,
      });
      this.pauseAgent();
      window.psAppGlobals.setCurrentRunningAgentId(undefined);
    } else {
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
      return html`<md-linear-progress indeterminate></md-linear-progress>`;
    } else {
      const progress = Math.min(1, Math.max(0, this.progress / 100));
      return html`<md-linear-progress
        value="${progress}"
      ></md-linear-progress>`;
    }
  }

  override render() {
    if (!this.agent) return nothing;

    if (this.agent.id == this.currentRunningAgentId) {
      this.parentElement!.className = 'agentContainer agentContainerRunning';
    } else {
      this.parentElement!.className = 'agentContainer';
    }

    return html`
      <div class="mainContainer">
        <img
          class="image"
          src="${this.agent.Class.configuration.imageUrl}"
          alt="${this.agent.Class.name}"
        />
        <div class="contentContainer">
          <div class="agentName">${this.agent.configuration['name']}</div>
          <div class="agentClassName">${this.agent.Class.name}</div>
          ${this.isWorking ? this.renderProgress() : nothing}
          <div class="statusMessage">${this.latestMessage}</div>
        </div>
        <div class="buttonContainer">
          <md-icon-button id="menuAnchor" @click="${this.toggleMenu}">
            <md-icon>more_vert</md-icon>
          </md-icon-button>
          <md-menu id="agentMenu" positioning="popover">
            <md-menu-item @click="${this.stopAgent}"
              ><div slot="headline">Stop Agent</div></md-menu-item
            >
            <md-menu-item @click="${this.addConnector}"
              ><div slot="headline">Add Connector</div></md-menu-item
            >
          </md-menu>

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
      </div>
    `;
  }
}
