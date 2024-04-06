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
  chatLogFromServer: PsAiChatWsMessage[] | undefined;

  onlyUseTextField = true;

  serverApi: ResearchServerApi;

  async prependNewElementWhenAvailable(): Promise<void> {
    let attempts = 0;
    const attemptInterval = 50; // milliseconds
    const maxAttempts = 20; // attempt up to 1 second
  
    const checkAndPrepend = () => {
      const parentElement: HTMLElement | null = this.shadowRoot?.querySelector('.chat-input') as HTMLElement;
      

      if (parentElement) {
     
  

        // Create a container for the prompts
        const promptsContainer: HTMLDivElement = document.createElement('div');
        promptsContainer.className = 'sample-prompts-container'; // Assign a class to the container for styling
  
        // Sample prompts
        const samplePrompts = [
          'Can you summarize the latest research on AI and participatory decision-making in urban planning?',
          'Can you give me examples of case studies or pilot projects where AI has been successfully integrated into public engagement?',
          'How can AI help in addressing misinformation during election campaigns?'
        ];
  
        // Create and append prompts to the container
        samplePrompts.forEach(promptText => {
          const promptElement: HTMLDivElement = document.createElement('div');
          promptElement.textContent = promptText;
          promptElement.className = 'sample-prompt'; // Assign a class for styling
          promptElement.style.cursor = 'pointer'; // Make it look clickable
          promptElement.addEventListener('click', () => this.handlePromptClick(promptText));
          promptsContainer.appendChild(promptElement); // Append the prompt to the container
        });
  
        // Prepend the container of prompts before the parentElement
        parentElement.before(promptsContainer);

        //adding more styles Like the chatinput styles
        const chatInputElement: HTMLElement | null = parentElement.querySelector('.textInput').shadowRoot?.querySelector('.field').shadowRoot?.querySelector('.container') as HTMLElement;    
        const inputLabel = chatInputElement.querySelector('.label')as HTMLElement;;
        inputLabel.style.fontFamily = 'Space Grotesk';

        

  
      } else if (attempts < maxAttempts) {
        // Element not found, wait and try again
        setTimeout(checkAndPrepend, attemptInterval);
        attempts++;
      } else {
        console.error('Parent element not found after waiting');
      }
    };
  
    checkAndPrepend();
  }
  
  
  async applyStylesForReferences(): Promise<void> {

  let attempts = 0;
  const attemptInterval = 2000; // milliseconds
  const maxAttempts = 20; // attempt up to 1 second

  const checkAndApply = () => {
    const parentElement: HTMLElement | null = this.shadowRoot?.querySelector('.chatElement') as HTMLElement;
    if (parentElement) {
      console.log('found one')
      //Outline styles for the prompts
      const outlineStylesElements: HTMLElement | null = parentElement.shadowRoot?.querySelector('.sourceButton') as HTMLElement;
      console.log("outlineStylesElements",outlineStylesElements)
      outlineStylesElements.setAttribute('style', `
      display: flex !important;
      width: 250px !important;
      height: 80px !important;
      padding: 12px !important;
      flex-direction: column!important;
      justify-content: space-between!important;
      align-items: flex-start!important;
      flex-shrink: 0!important;
      background-color: #fff!important;
      border: 1px solid black!important;
      border-radius: 0 !important;
      white-space: collapse balance!important;
      font-size: 12px!important;
    `);
    console.log('applied!');
    
    const styleEl = document.createElement('style');
    styleEl.textContent = `
  md-elevated-button, .sourceButton {
    display: flex !important;
    width: 250px !important;
    height: 80px !important;
    padding: 12px !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    flex-shrink: 0 !important;
    background-color: #fff !important;
    border: 1px solid black !important;
    border-radius: 0 !important;
    white-space: collapse balance !important;
    font-size: 12px !important;
  }
`;
parentElement.prepend(styleEl);

// Prepend the style element to the head of the document



    } else if (attempts < maxAttempts) {
      // Element not found, wait and try again
      console.log('waiting')
      setTimeout(checkAndApply, attemptInterval);
      attempts++;
    } else {
      console.error('Parent element not found after waiting');
    }
  };

  checkAndApply();
}

  
  handlePromptClick(promptText: string): void {
    // Assuming chatInputField is the input element where users type their messages
    // You need to ensure this.chatInputField is correctly defined and points to the actual input element
    if (this.chatInputField) {
      this.chatInputField.value = promptText; // Set the input field's value to the prompt's text
      this.sendChatMessage(); // Send the message
      
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultInfoMessage = this.t("I'm your helpful web Rebooting Democracy assistant");
    this.textInputLabel = this.t('Ask a question here!');
    
    this.serverApi = new ResearchServerApi();
    this.prependNewElementWhenAvailable();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`
        .chat-window {
          height: 85vh;
          width: 100vw;
          font-family: 'Space Grotesk', monospace!important;
        }
        .sample-prompts-container {
          display: flex;
          flex-direction: column;
          gap: 10px; /* Adjust the space between each prompt */
        }
        .sample-prompt {
          background-color: transparent;
          margin: 0 30px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color .3s ease;
          border: 1px solid #0bcac4;
          color: #04787f;
          font-size: .9rem;
          font-weight: 600;
          font-family: Space Grotesk, sans-serif;
        }
        .sample-prompt:hover {
          background-color: #0bcac42e; /* Slightly darker cyan on hover */
        }
        md-elevated-button, .sourceButton
        {
          display: flex!important;
      width: 250px!important;
      height: 80px!important;
      padding: 12px!important;
      flex-direction: column!important;
      justify-content: space-between!important;
      align-items: flex-start!important;
      flex-shrink: 0!important;
      background-color: #fff!important;
      border: 1px solid black!important;
      border-radius: 0 !important;
      white-space: collapse balance!important;
      font-size: 12px!important;
        }
      `,
    ];
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('chatLogFromServer') && this.chatLogFromServer) {
      this.chatLog = this.chatLogFromServer;
    }
  }

  override async sendChatMessage() {
    const userMessage = this.chatInputField!.value;
    if (this.chatLog.length === 0) {
      this.fire('start-process');
    }
    super.sendChatMessage();

    this.addUserChatBotMessage(userMessage);
    
    this.applyStylesForReferences();
    await this.serverApi.conversation(
      this.serverMemoryId,
      this.simplifiedChatLog,
      this.wsClientId,
      this.numberOfSelectQueries,
      this.percentOfTopQueriesToSearch,
      this.percentOfTopResultsToScan
    );
  }


}
