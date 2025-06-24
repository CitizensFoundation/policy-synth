import { html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { PsRouter } from "./base/router/router.js";

import "@material/web/slider/slider.js";
import "@material/web/iconbutton/outlined-icon-button.js";

import "@material/web/menu/menu.js";
import { MdMenu } from "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";

import "./eric-chatbot.js";
import { PolicySynthWebApp } from "./base/ps-app.js";
import { ResearchServerApi } from "./researchServerApi.js";
import { EcasEricChatBot } from "./eric-chatbot.js";
import { PropertyValueMap } from "@lit/reactive-element";
import { authStoreInstance } from "./services/authStore.js";
import { adminServerApi } from "./services/adminServerApi.js";

import "./admin/admin-dashboard.js";
import "./admin/admin-login.js";

type SavedChat = {
  serverMemoryId: string;
  questionSnippet: string;
};

// ... SavedChat, Topic interfaces ...
interface Topic {
  id: number;
  slug: string;
  title: string;
  description?: string;
  language?: string;
}

const shouldRenderAdmin = () => window.location.pathname.startsWith("/admin");

@customElement("eric-chatbot-app")
export class EcasYeaChatBotApp extends PolicySynthWebApp {
  themeColor = "#1D42D9";
  localStorageThemeColorKey = "md3-ecas-eric-theme-color-v3";
  localeStorageChatsKey = "ecas-eric-chats-v3";

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

  // Change type to PsSimpleChatLog[]
  @property({ type: Array })
  chatLogFromServer: PsSimpleChatLog[] = [];

  @property({ type: String })
  llmTotalCost = "$0.000";

  @property({ type: String })
  runningTime = "0h 0m 0s";

  @property({ type: Array })
  savedChats: SavedChat[] = [];

  runningTimeInterval: number | undefined;

  startTime: Date | undefined;

  estimatedSecondsPerPage = 40;

  serverApi: ResearchServerApi;

  @state()
  private loading = false; // Add loading state
  @state()
  private authStateCounter = authStoreInstance.updateCounter;
  @state()
  private availableTopics: Topic[] = [];
  @state()
  private selectedTopicId: number | undefined;
  @state()
  private topicNotFound = false;

  private currentSlug: string | undefined;

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
    const chatBotElement = this.$$("eric-chat-bot") as EcasEricChatBot;
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
      localStorage.setItem(
        this.localeStorageChatsKey,
        JSON.stringify(this.savedChats)
      );
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.loadChatsFromLocalStorage();
  }

  openMenu() {
    const menu = this.$$("#usage-menu") as MdMenu;
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
              (chat) => html`
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
        .boldEcas {
          font-weight: 600;
        }

        .logo {
          height: 50px;
          margin: 32px;
        }

        @media (max-width: 600px) {
          .logo {
            height: 32px;
            margin: 16px;
          }
        }

        simple-chat-bot {
          width: 100vw;
          height: 100%;
        }

        .topHeader {
          margin-top: 0px;
          max-width: 1100px;
          width: 100%;
        }

        eric-chat-bot {
          max-width: 1000px;
        }

        @media (max-width: 600px) {
          eric-chat-bot {
            max-width: 100%;
          }
        }

        .ecasTopLeft {
          font-size: 16px;
          color: #1d42d9;
        }

        @media (max-width: 600px) {
          .ecasTopLeft {
            display: none !important;
          }
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
      path: "/:slug",
      render: this.renderApp.bind(this),
    },
    {
      path: "*",
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

    const slug = this.router.params["slug"];
    if (slug) {
      this.handleSlugChange(slug);
    } else {
      this.handleSlugChange(undefined);
    }
  }

  async getChatLogFromServer() {
    if (this.serverMemoryId && this.isChatLogIdValid(this.serverMemoryId)) {
      this.loading = true;
      try {
        // Assuming serverApi.getChatLogFromServer returns { chatLog: PsSimpleChatLog[], totalCosts: number }
        const history = await this.serverApi.getChatLogFromServer(
          this.serverMemoryId
        );
        if (history && history.chatLog) {
          // Assign directly if type matches
          this.chatLogFromServer = history.chatLog;
          this.llmTotalCost = history.totalCosts
            ? `$${history.totalCosts.toFixed(3)}`
            : "$0.000";
          this.startTimer();
        } else {
          this.serverMemoryId = undefined;
        }
      } catch (error) {
        console.error("Error fetching chat log:", error);
        this.serverMemoryId = undefined;
      } finally {
        this.loading = false;
      }
    } else {
      this.serverMemoryId = undefined;
    }
  }

  isChatLogIdValid(serverMemoryId: string): boolean {
    return this.savedChats.some(
      (chat) => chat.serverMemoryId === serverMemoryId
    );
  }

  handleServerMemoryIdCreated(event: CustomEvent) {
    this.serverMemoryId = event.detail;
    const path = `/chat/${this.serverMemoryId}`;
    //history.pushState({}, '',path);
    this.saveChatToLocalStorage();
  }

  private async loadChatLog(serverMemoryId: string): Promise<void> {
    this.serverMemoryId = serverMemoryId;
    (this.$$("eric-chat-bot") as EcasEricChatBot).reset();
    await this.getChatLogFromServer();
    const path = `/chat/${this.serverMemoryId}`;
    //history.pushState({}, '', path);
    this.requestUpdate();
  }

  private async handleSlugChange(slug: string | undefined) {
    if (slug === this.currentSlug) {
      return;
    }
    this.currentSlug = slug;

    if (!slug) {
      this.selectedTopicId = undefined;
      this.topicNotFound = false;
      return;
    }

    try {
      const topic = await adminServerApi.getTopic(slug);
      this.availableTopics = [topic];
      this.selectedTopicId = topic.id;
      this.topicNotFound = false;
    } catch (e) {
      console.warn("Topic not found for slug:", slug);
      this.selectedTopicId = undefined;
      this.topicNotFound = true;
    }
  }

  renderApp() {
    if (this.topicNotFound) {
      return html`<p>Topic not found</p>`;
    }

    return html` <div class="layout vertical">
      <div class="layout horizontal center-center">
        <div class="layout horizontal center-center topHeader">
          <img
            src="https://yrpri-eu-direct-assets.s3.eu-west-1.amazonaws.com/logo_%402x_one.gif"
            class="logo"
          />
          <div class="flex"></div>
          <div style="margin-top: 32px;" hidden>
            <md-outlined-button class="menuButton" @click="${this.reset}"
              >${this.t("New chat")}</md-outlined-button
            >
          </div>
          <div class="flex"></div>
          <div hidden class="layout horizontal ecasTopLeft" style="margin-left: 32px">
            <span class="boldEcas">E</span>CAS &nbsp; <span class="boldEcas">R</span>ights &nbsp; <span class="boldEcas">I</span>nformation &nbsp; <span class="boldEcas">C</span>entre</span>
          </div>
        </div>
      </div>
      <div class="layout horizontal center-center">
        <eric-chat-bot
          @llm-total-cost-update=${this.handleCostUpdate}
          @server-memory-id-created=${this.handleServerMemoryIdCreated}
          @start-process=${this.startTimer}
          @stop-process=${this.stopTimer}
          @reset-chat=${this.reset}
          .serverMemoryId=${this.serverMemoryId}
          .chatLogFromServer=${this.chatLogFromServer}
          .currentTopicId=${this.selectedTopicId}
        ></eric-chat-bot>
      </div>
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
    this.runningTime = "0h 0m 0s";
  }

  reset() {
    (this.$$("eric-chat-bot") as EcasEricChatBot).reset();
    this.serverMemoryId = undefined;
    this.chatLogFromServer = undefined;
    history.pushState({}, "", "");
    this.selectedTopicId = undefined;
    this.topicNotFound = false;
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

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    const slug = this.router.params["slug"];
    if (slug !== this.currentSlug) {
      this.handleSlugChange(slug);
    }
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
  override render() {
    if (shouldRenderAdmin()) {
      if (window.location.pathname.includes("/admin/login")) {
        return html` <admin-login></admin-login> `;
      } else {
        return html` <admin-dashboard></admin-dashboard> `;
      }
    } else {
      return super.render();
    }
  }
}
