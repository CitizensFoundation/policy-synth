import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';
import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';
@customElement('rebooting-democracy-chat-bot')
export class RebootingDemocracyChatBot extends PsChatAssistant {
    @property({ type: Number })
    defaultDevWsPort = 5021;
    @property({ type: Number })
    numberOfSelectQueries = 5;
    @property({ type: Number })
    percentOfTopQueriesToSearch = 0.25;
    @property({ type: Number })
    percentOfTopResultsToScan = 0.25;
    @property({ type: Array })
    chatLogFromServer;
    showCleanupButton = true;
    onlyUseTextField = true;
    serverApi;
    connectedCallback() {
        super.connectedCallback();
        this.defaultInfoMessage = this.t("I'm your helpful web Rebooting Democracy assistant");
        this.textInputLabel = this.t('How can I help?');
        this.serverApi = new ResearchServerApi();
    }
    static get styles() {
        return [
            ...super.styles,
            css `
        .chat-window {
          height: 85vh;
          width: 100vw;
        }
      `,
        ];
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('chatLogFromServer') && this.chatLogFromServer) {
            this.chatLog = this.chatLogFromServer;
        }
    }
    async sendChatMessage() {
        const userMessage = this.chatInputField.value;
        if (this.chatLog.length === 0) {
            this.fire('start-process');
        }
        super.sendChatMessage();
        this.addUserChatBotMessage(userMessage);
        await this.serverApi.conversation(this.serverMemoryId, this.simplifiedChatLog, this.wsClientId, this.numberOfSelectQueries, this.percentOfTopQueriesToSearch, this.percentOfTopResultsToScan);
    }
}
