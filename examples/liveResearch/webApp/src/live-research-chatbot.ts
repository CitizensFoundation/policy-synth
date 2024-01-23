import { customElement, property } from 'lit/decorators.js';
import { css } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/cmp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';

@customElement('live-research-chat-bot')
export class LiveResearchChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5021;

  serverApi: ResearchServerApi;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = this.t("I'm your helpful web research assistant")
    this.textInputLabel = this.t("Please state your research question.");
    this.serverApi = new ResearchServerApi();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        .chat-window {
          height: 85vh;
          width: 100vw;
        }
      `,
    ];
  }

  addChatBotElement(data: PsAiChatWsMessage) {
    const lastElement = this.chatElements![this.chatElements!.length - 1];
    switch (data.type) {
      case 'hello_message':
        this.addToChatLogWithMessage(data);
        break;
      case 'thinking':
        if (lastElement) {
          lastElement.active = false;
        }
        this.addToChatLogWithMessage(data, this.t('Thinking...'));
        break;
      case 'noStreaming':
        if (lastElement) {
          lastElement.active = true;
        }
        this.addToChatLogWithMessage(data, data.message);
        break;
      case 'agentStart':
      case 'validationAgentStart':
        console.log('agentStart')
        if (lastElement) {
          lastElement.active = false;
        }
        const startOptions = data.message as unknown as PsAgentStartWsOptions;

        setTimeout(() => {
          this.scrollDown();
        }, 50);

        if (startOptions.noStreaming) {
          this.addChatBotElement({
            sender: 'bot',
            type: 'noStreaming',
            message: startOptions.name,
          });
        } else {
          this.addToChatLogWithMessage(data, startOptions.name);
          this.chatLog[
            this.chatLog.length - 1
          ].message = `${startOptions.name}\n\n`;
        }
        this.requestUpdate();
        break;
      case 'agentCompleted':
      case 'validationAgentCompleted':
        console.log('agentCompleted')
        if (lastElement) {
          lastElement.active = false;
        } else {
          console.error('No last element on agentCompleted');
        }

        const completedOptions =
          data.message as unknown as PsAgentCompletedWsOptions;

        break;
      case 'start':
        if (lastElement) {
          lastElement.active = false;
        }
        this.addToChatLogWithMessage(data, this.t('Thinking...'));
        if (!this.chatLog[this.chatLog.length - 1].message)
          this.chatLog[this.chatLog.length - 1].message = '';
        break;
      case 'start_followup':
        lastElement.followUpQuestionsRaw = '';
        break;
      case 'stream_followup':
        lastElement.followUpQuestionsRaw += data.message;
        this.requestUpdate();
        break;
      case 'info':
        this.infoMessage = data.message;
        break;
      case 'moderation_error':
        data.message =
          'OpenAI Moderation Flag Error. Please refine your question.';
        this.addToChatLogWithMessage(data, data.message, false, this.t('Send'));
        break;
      case 'error':
        this.addToChatLogWithMessage(data, data.message, false, this.t('Send'));
        break;
      case 'end':
        lastElement.stopJsonLoading();
        this.chatLog[this.chatLog.length - 1].debug = data.debug;
        this.sendButton!.disabled = false;
        this.sendButton!.innerHTML = this.t('Send');
        this.infoMessage = this.defaultInfoMessage;
        break;
      case 'message':
        if (lastElement) {
          lastElement.active = false;
        }
        this.addToChatLogWithMessage(
          data,
          data.message,
          undefined,
          undefined,
          data.refinedCausesSuggestions
        );
        this.chatLog[this.chatLog.length - 1].refinedCausesSuggestions =
          data.refinedCausesSuggestions;
        this.sendButton!.disabled = false;
        this.sendButton!.innerHTML = this.t('Send');
        this.infoMessage = this.defaultInfoMessage;
        this.requestUpdate();
        break;
      case 'stream':
        if (data.message && data.message != 'undefined') {
          //@ts-ignore
          this.infoMessage = this.t('typing');
          this.chatLog[this.chatLog.length - 1].message =
            this.chatLog[this.chatLog.length - 1].message + data.message;
          //console.error(this.chatLog[this.chatLog.length - 1].message)
          this.requestUpdate();
          break;
        }
    }

    this.scrollDown();
  }

  override async sendChatMessage() {
    const userMessage = this.chatInputField!.value;

    super.sendChatMessage();

    this.addUserChatBotMessage(userMessage);

    await this.serverApi.conversation(this.simplifiedChatLog, this.wsClientId);
  }
}
