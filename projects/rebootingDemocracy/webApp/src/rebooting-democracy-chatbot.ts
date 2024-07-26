import { customElement, property } from 'lit/decorators.js';
import { css, html, nothing } from 'lit';

import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';
import { ResearchServerApi } from './researchServerApi.js';
import './rb-ai-chat-element.js';

@customElement('rebooting-democracy-chat-bot')
export class RebootingDemocracyChatBot extends PsChatAssistant {
  @property({ type: Number })
  defaultDevWsPort = 5043;

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
      const parentElement: HTMLElement | null = this.shadowRoot?.querySelector('.chat-messages') as HTMLElement;
      

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
 const introText: HTMLDivElement = document.createElement('div');
 introText.innerHTML = `Welcome to the Reboot Democracy Bot. Trained on research and writing from the GovLab and the Reboot Blog, I answer your questions about technology, governance and democracy.<br> <br>Type a question you have about AI, democracy and governance in the box below. Here are some sample prompts to get you started!`;
  promptsContainer.prepend(introText);
        // Prepend the container of prompts before the parentElement
        parentElement.prepend(promptsContainer);

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
    const parentElement: NodeList | null = this.shadowRoot?.querySelectorAll('.chatElement') as NodeList;
    if (parentElement) {
      
      parentElement.forEach((chatElement: Node) => {
        // Ensure each chatElement is an HTMLElement before trying to access HTMLElement-specific properties or methods
        if (chatElement instanceof HTMLElement && chatElement.shadowRoot) {
          const sourceDocumentsContainer = chatElement.shadowRoot.querySelector('.sourceDocumentsContainer');
          
          if (sourceDocumentsContainer) {
            // Check for existing style element
            const existingStyleEl = chatElement.shadowRoot.querySelector('style');
            if (!existingStyleEl) {
              const styleEl = document.createElement('style');
              styleEl.textContent = `
              .sourceButton {
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
              chatElement.shadowRoot.prepend(styleEl);
            }
          }
        }
      })
//       const styleEl = document.createElement('style');
//       styleEl.textContent = `
//     .sourceButton {
//       display: flex !important;
//       width: 250px !important;
//       height: 80px !important;
//       padding: 12px !important;
//       flex-direction: column !important;
//       justify-content: space-between !important;
//       align-items: flex-start !important;
//       flex-shrink: 0 !important;
//       background-color: #fff !important;
//       border: 1px solid black !important;
//       border-radius: 0 !important;
//       white-space: collapse balance !important;
//       font-size: 12px !important;
//     }
//   `;
//       parentElement.shadowRoot?.prepend(styleEl);

//       console.log('found one')
//       //Outline styles for the prompts
//       const outlineStylesElements: HTMLElement | null = parentElement.shadowRoot?.querySelector('.sourceButton') as HTMLElement;
//       console.log("outlineStylesElements",outlineStylesElements)
//     //   outlineStylesElements.setAttribute('style', `
//     //   display: flex !important;
//     //   width: 250px !important;
//     //   height: 80px !important;
//     //   padding: 12px !important;
//     //   flex-direction: column!important;
//     //   justify-content: space-between!important;
//     //   align-items: flex-start!important;
//     //   flex-shrink: 0!important;
//     //   background-color: #fff!important;
//     //   border: 1px solid black!important;
//     //   border-radius: 0 !important;
//     //   white-space: collapse balance!important;
//     //   font-size: 12px!important;
//     // `);
//     console.log('applied!');
   
// parentElement.shadowRoot?.prepend(styleEl);

// // Prepend the style element to the head of the document



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
    console.log("am I here?")    
this.prependNewElementWhenAvailable();
  }

  static override get styles() {
    return [
      ...super.styles,
      css`


        .chat-window {
          height: 78vh;
          width: 100vw;
          font-family: 'Space Grotesk', monospace!important;
border: 1px solid #65d0f0;      
  }

md-icon
{
    padding-right: 5px;
}
.link-list
	{
    color: var(--teal-text);
    display: flex;
    align-content: center;
    justify-content: flex-start;
    flex-direction: row;
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


renderSourceDialog() {

interface Reference {
    url: string;
    reference: string;
}

  let references: Reference[] = [];

  try {
    const jsonString = this.currentDocumentSourceToDisplay.allReferencesWithUrls as unknown as string;
    references = JSON.parse(jsonString) as Reference[];
  } catch (error) {
    console.error("Failed to parse references:", error);
  }

  return html`
    <md-dialog
      id="sourceDialog"
      @closed="${() => this.cancelSourceDialog()}"
      ?fullscreen="${!this.wide}"
      class="dialog"
      id="dialog"
    >
      ${this.currentDocumentSourceToDisplay
        ? html`
          <div slot="headline">
            ${this.currentDocumentSourceToDisplay.title}
          </div>
          <div slot="content" id="content">
            <div class="layout vertical">
              <div class="layout horizontal center-center">
                <img
                  src="https://www.google.com/s2/favicons?domain=${this.stripDomainForFacIcon(this.currentDocumentSourceToDisplay.url)}&sz=24"
                  slot="icon"
                  width="24"
                  height="24"
                  class="sourceFavIcon"
                />
              </div>
              <div class="currentSourceDescription">
                ${this.currentDocumentSourceToDisplay.compressedFullDescriptionOfAllContents}
              </div>
<div class="layout horizontal center-center sourceLinkButton">
  ${this.currentDocumentSourceToDisplay.url.toLowerCase().indexOf('.pdf') > -1 && !this.currentDocumentSourceToDisplay.contentType.includes('json')
    ? html`
      <a href="${this.currentDocumentSourceToDisplay.url}" target="_blank" download>
        <md-filled-button>${this.t('Open PDF')}</md-filled-button>
      </a>
    `
    : !this.currentDocumentSourceToDisplay.contentType.includes('json')
      ? html`
        <a href="${this.currentDocumentSourceToDisplay.url}" target="_blank">
          <md-filled-button>${this.t('Visit Website')}</md-filled-button>
        </a>
      `
      : nothing
  }

          
                ${references.length > 0 && this.currentDocumentSourceToDisplay.contentType.includes('json')
                  ? html`
                <md-list style="max-width: 450px;">
                      ${references.map(ref => html`
 <md-list-item>
                        <a class="link-list" href="${ref.url}" target="_blank"> <md-icon slot="end">open_in_new</md-icon>${ref.reference}

</a>    
</md-list-item>
                      `)}
</md-list>
                  `
                  : nothing}
    </div>
            </div>
          </div>`
        : nothing}
      <div slot="actions">
        <md-text-button @click="${() => this.cancelSourceDialog()}">
          ${this.t('cancel')}
        </md-text-button>
      </div>
    </md-dialog>
  `;
}



  override render() {
    return html`
      ${this.renderSourceDialog()}
      <div class="chat-window" id="chat-window">
        <div class="chat-messages" id="chat-messages">
          <ps-ai-chat-element
            ?hidden="${!this.defaultInfoMessage}"
            class="chatElement bot-chat-element"
            .detectedLanguage="${this.language}"
            .message="${this.defaultInfoMessage}"
            type="info"
            sender="bot"
          ></ps-ai-chat-element>
          ${this.chatLog
            .filter(chatElement => !chatElement.hidden)
            .map(
              chatElement => html`
                <rb-ai-chat-element
                  ?thinking="${chatElement.type === 'thinking' ||
                  chatElement.type === 'noStreaming'}"
                  @followup-question="${this.followUpQuestion}"
                  @ps-open-source-dialog="${this.openSourceDialog}"
                  .clusterId="${this.clusterId}"
                  class="chatElement ${chatElement.sender}-chat-element"
                  .detectedLanguage="${this.language}"
                  .wsMessage="${chatElement}"
                  .message="${chatElement.message}"
                  @scroll-down-enabled="${() => (this.userScrolled = false)}"
                  .type="${chatElement.type}"
                  .sender="${chatElement.sender}"
                ></rb-ai-chat-element>
              `
            )}
        </div>
        <div class="layout horizontal center-center chat-input">
          ${this.renderChatInput()}
        </div>
      </div>
    `;
  }


}
