import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/base/router/router.js';

import '@material/web/slider/slider.js';
import '@material/web/iconbutton/outlined-icon-button.js';

import '@material/web/menu/menu.js';
import { MdMenu } from '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import './eric-chatbot.js';
import { PolicySynthWebApp } from '@policysynth/webapp/ps-app.js';
import { ResearchServerApi } from './researchServerApi.js';
import { EcasEricChatBot } from './eric-chatbot.js';
import { PropertyValueMap } from '@lit/reactive-element';

type SavedChat = {
  serverMemoryId: string;
  questionSnippet: string;
};

@customElement('eric-chatbot-app')
export class EcasYeaChatBotApp extends PolicySynthWebApp {
  themeColor = '#004f9f';
  localStorageThemeColorKey = 'md3-ecas-eric-theme-color';
  localeStorageChatsKey= "ecas-eric-chats-v1"

  @property({ type: Number })
  numberOfSelectQueries = 5;

  @property({ type: Number })
  percentOfTopQueriesToSearch = 0.25;

  @property({ type: Number })
  percentOfTopResultsToScan = 0.25;

  @property({ type: Boolean })
  privateChatLogs = true;

  @property({ type: String })
  serverMemoryId: string | undefined;

  @property({ type: Array })
  chatLogFromServer: PsAiChatWsMessage[] = [];

  @property({ type: String })
  llmTotalCost = '$0.000';

  @property({ type: String })
  runningTime = '0h 0m 0s';

  @property({ type: Array })
  savedChats: SavedChat[] = [];

  runningTimeInterval: number | undefined;

  startTime: Date | undefined;

  estimatedSecondsPerPage = 40;

  serverApi: ResearchServerApi;

  constructor() {
    super();
    this.serverApi = new ResearchServerApi();
  }

  loadChatsFromLocalStorage(): void {
    const storedChats = localStorage.getItem(this.localeStorageChatsKey);
    if (storedChats) {
      this.savedChats = JSON.parse(storedChats) as SavedChat[];
    }
  }

  saveChatToLocalStorage(): void {
    const chatBotElement = this.$$(
      'eric-chat-bot'
    ) as EcasEricChatBot;
    if (
      chatBotElement &&
      chatBotElement.chatLog &&
      chatBotElement.chatLog.length > 0
    ) {
      const questionSnippet = chatBotElement.chatLog[0].message.slice(0, 40);
      const newChat: SavedChat = {
        serverMemoryId: this.serverMemoryId as string,
        questionSnippet,
      };
      this.savedChats.push(newChat);
      localStorage.setItem(this.localeStorageChatsKey, JSON.stringify(this.savedChats));
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.loadChatsFromLocalStorage();
  }

  openMenu() {
    const menu = this.$$('#usage-menu') as MdMenu;
    menu.open = true;
  }

  renderSavedChatsDropdown() {
    if (this.savedChats.length == 0) {
      return html``;
    } else {
      return html`
        <span style="position: relative">
          <md-outlined-button
            class="menuButton"
            id="usage-anchor"
            @click="${this.openMenu}"
            >Previous Chats</md-outlined-button
          >
          <md-menu id="usage-menu" anchor="usage-anchor">
            ${this.savedChats.map(
              chat => html`
                <md-menu-item
                  @click="${() => this.loadChatLog(chat.serverMemoryId)}"
                >
                  <div slot="headline">${chat.questionSnippet}</div>
                </md-menu-item>
              `
            )}
          </md-menu>
        </span>
      `;
    }
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        simple-chat-bot {
          width: 100vw;
          height: 100%;
        }

        .themeToggle {
          margin-bottom: 12px;
        }

        md-slider {
          width: 220px;
        }

        .sliderTitle {
          font-size: 12px;
          padding-left: 16px;
          margin-bottom: 8px;
        }

        .menuButton {
          margin-bottom: 32px;
          margin-left: 8px;
          margin-right: 8px;
        }

        md-menu-item {
          width: 250px;
        }

        .sliderScopes,
        .estTime {
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .estTime {
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .topInfoItem {
          margin-right: 16px;
        }

        .scopeSliders {
          margin-left: 32px;
        }
      `,
    ];
  }

  override router: PsRouter = new PsRouter(this, [
    {
      path: '*',
      render: this.renderApp.bind(this),
    },
  ]);

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    // Get the server memory id from the url
    let path = window.location.pathname;
    path = path.replace("/chat/", "");
    path = path.replace("chat/", "");
    if (path.length > 1) {
      this.serverMemoryId = path.substring(1);
      console.log("Server memory id from url: ", this.serverMemoryId);
    }
    if (this.serverMemoryId) {
      this.getChatLogFromServer();
    }
  }

  async getChatLogFromServer() {
    const chatBotElemement = this.$$(
      'eric-chat-bot'
    ) as EcasEricChatBot;
    if (
      chatBotElemement &&
      chatBotElemement.chatLog.length == 0 &&
      this.serverMemoryId
    ) {
      if (this.privateChatLogs && !this.isChatLogIdValid(this.serverMemoryId)) {
        console.error('Access denied: Chat log ID is not in the saved list.', this.serverMemoryId);
        return; // Prevent access if ID is not valid
      }

      const { chatLog, totalCosts } = await this.serverApi.getChatLogFromServer(
        this.serverMemoryId
      );
      if (totalCosts) {
        this.setCost(totalCosts);
      }
      if (chatLog) {
        //TODO: Fix this sender hack, should be consistent
        this.chatLogFromServer = chatLog.map((chatLogItem: any) => {
          return {
            ...chatLogItem,
            date: new Date(chatLogItem.date),
            sender: ['assistant', 'bot'].includes(chatLogItem.sender)
              ? 'bot'
              : 'you',
          };
        });
        this.requestUpdate();
      } else {
        console.error('No chat log from server');
      }
    } else {
      console.error('No serverMemoryId');
    }
  }

  isChatLogIdValid(serverMemoryId: string): boolean {
    return this.savedChats.some(chat => chat.serverMemoryId === serverMemoryId);
  }

  handleServerMemoryIdCreated(event: CustomEvent) {
    this.serverMemoryId = event.detail;
    const path = `/chat/${this.serverMemoryId}`;
    history.pushState({}, '',path);
    this.saveChatToLocalStorage();
  }

  private async loadChatLog(serverMemoryId: string): Promise<void> {
    this.serverMemoryId = serverMemoryId;
    (this.$$(
      'eric-chat-bot'
    ) as EcasEricChatBot).reset();
    await this.getChatLogFromServer();
    const path = `/chat/${this.serverMemoryId}`;
    history.pushState({}, '', path);
    this.requestUpdate();
  }

  renderApp() {
    return html` <div class="layout vertical">
      <div class="layout horizontal center-center themeToggle">
        <img src="https://ecas.org/wp-content/uploads/2022/10/ECAS-logo.png" style="height: 90px;margin: 32px;"/>
        <div class="flex"></div>
        <div style="margin-top: 32px;">
          ${this.renderSavedChatsDropdown()}
          <md-outlined-button
            class="menuButton"
            @click="${this.reset}"
            >${this.t('New chat')}</md-outlined-button
          >
        </div>
        <div class="flex"></div>
        <div class="layout horizontal" style="margin-left: 32px">${this.renderThemeToggle(true)}</div>
      </div>
      <eric-chat-bot
        @llm-total-cost-update=${this.handleCostUpdate}
        @server-memory-id-created=${this.handleServerMemoryIdCreated}
        @start-process=${this.startTimer}
        @stop-process=${this.stopTimer}
        @reset-chat=${this.reset}
        .serverMemoryId=${this.serverMemoryId}
        .chatLogFromServer=${this.chatLogFromServer}
        .numberOfSelectQueries=${this.numberOfSelectQueries}
        .percentOfTopQueriesToSearch=${this.percentOfTopQueriesToSearch}
        .percentOfTopResultsToScan=${this.percentOfTopResultsToScan}
      ></eric-chat-bot>

    </div>`;
  }

  updateRunningTime() {
    if (this.startTime) {
      const now = new Date();
      const diff = now.getTime() - this.startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.runningTime = `${hours}h ${minutes}m ${seconds}s`;

      // Update every second
      this.runningTimeInterval = setTimeout(
        () => this.updateRunningTime(),
        1000
      ) as unknown as number;
    }
  }

  startTimer() {
    this.startTime = new Date();
    this.updateRunningTime();
  }

  stopTimer() {
    if (this.runningTimeInterval) {
      clearTimeout(this.runningTimeInterval);
      this.runningTimeInterval = null;
    }
    this.startTime = null;
    this.runningTime = '0h 0m 0s';
  }

  reset() {
    (this.$$('eric-chat-bot') as EcasEricChatBot).reset();
    this.serverMemoryId = undefined;
    this.chatLogFromServer = undefined;
    history.pushState({}, '', '');
    this.setCost(0);
  }

  setCost(cost: number) {
    const costString = cost.toFixed(3);
    this.llmTotalCost = `$${costString}`;
  }

  handleCostUpdate(event: CustomEvent) {
    this.setCost(event.detail);
  }

  updateNumberOfQueries(event: any) {
    this.numberOfSelectQueries = event.currentTarget.value;
  }

  updatePercentOfQueries(event: any) {
    this.percentOfTopQueriesToSearch = event.currentTarget.value / 100;
  }

  updatePercentOfResults(event: any) {
    this.percentOfTopResultsToScan = event.currentTarget.value / 100;
  }

  get totalSearchResults() {
    return Math.round(
      this.numberOfSelectQueries * 10 * this.percentOfTopQueriesToSearch
    );
  }

  get totalPagesToGet() {
    return Math.round(this.totalSearchResults * this.percentOfTopResultsToScan);
  }

  get estimatedTotalTime() {
    const totalSeconds = Math.round(
      this.totalPagesToGet * this.estimatedSecondsPerPage
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime;

    if (hours > 0) {
      formattedTime = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formattedTime = `${minutes}m ${seconds}s`;
    } else {
      formattedTime = `${seconds}s`;
    }

    return formattedTime;
  }


}
