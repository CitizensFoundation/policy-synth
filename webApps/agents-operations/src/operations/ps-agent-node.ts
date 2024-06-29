import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
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

  api: OpsServerApi;

  constructor() {
    super();
    this.api = new OpsServerApi();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.agent = window.psAppGlobals.getAgentInstance(this.agentId);
  }

  static override get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }

        .mainContainer {
          height: 275px;
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
          flex-grow: 1;
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

  toggleMenu() {
    const menu = this.shadowRoot?.getElementById('menu') as MdMenu;
    menu.open = !menu.open;
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

  override render() {
    if (!this.agent) return nothing;

    if (this.agent.id == this.currentRunningAgentId) {
      this.parentElement!.className = "agentContainer agentContainerRunning";
    } else {
      this.parentElement!.className = "agentContainer";
    }

    return html`
      <div class="mainContainer">
        <img class="image" src="${this.agent.Class.configuration.imageUrl}" alt="${this.agent.Class.name}">
        <div class="contentContainer">
          <div class="agentClassName">${this.agent.Class.name}</div>
          <div class="agentName">${this.agent.configuration['name']}</div>
        </div>
        <div class="buttonContainer">
          <md-icon-button @click="${this.toggleMenu}">
            <md-icon>more_vert</md-icon>
          </md-icon-button>
          ${this.isWorking
            ? html`<md-circular-progress indeterminate></md-circular-progress>`
            : html`
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
              `}
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
}