# PsChatAssistant

PsChatAssistant is a custom web component that acts as a chat assistant interface. It is built using LitElement and integrates with various Material Design components and a WebSocket API for real-time chat functionality. The component allows users to interact with an AI chatbot, sending messages and receiving responses, including follow-up questions and actions. It supports features like dynamic message loading, input focus management, and dark mode toggling.

## Properties

| Name                            | Type                                              | Description                                                                 |
|---------------------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| chatLog                         | PsAiChatWsMessage[]                               | Stores the chat messages exchanged in the session.                          |
| infoMessage                     | string                                            | Displays informational messages to the user.                                |
| wsClientId                      | string                                            | The client ID used for WebSocket communication.                             |
| webSocketsErrorCount            | number                                            | Tracks the number of WebSocket errors encountered.                          |
| defaultInfoMessage              | string                                            | The default informational message displayed to the user.                    |
| wsEndpoint                      | string                                            | The WebSocket endpoint URL for chat communication.                          |
| ws                              | WebSocket                                         | The WebSocket object used for real-time communication.                      |
| inputIsFocused                  | boolean                                           | Indicates if the chat input field is currently focused.                     |
| onlyUseTextField                | boolean                                           | Determines if only the text field should be used for input.                 |
| currentDocumentSourceToDisplay  | PsSimpleDocumentSource \| undefined               | The current document source to display in the UI.                           |
| clusterId                       | number                                            | The cluster ID associated with the chat session.                            |
| userScrolled                    | boolean                                           | Indicates if the user has manually scrolled the chat window.                |
| communityId                     | number                                            | The community ID associated with the chat session.                          |
| textInputLabel                  | string                                            | The label for the chat input field.                                         |
| currentFollowUpQuestions        | string                                            | Stores the current follow-up questions provided by the chatbot.             |
| programmaticScroll              | boolean                                           | Indicates if the chat window scroll was initiated programmatically.         |
| showCleanupButtonAtBottom       | boolean                                           | Determines if the cleanup button should be shown at the bottom of the chat. |
| scrollStart                     | number                                            | The starting point of a scroll action in the chat window.                   |
| serverMemoryId                  | string \| undefined                               | The server memory ID used for tracking the chat session state.              |
| defaultDevWsPort                | number                                            | The default WebSocket port used during development.                         |

## Methods

| Name                    | Parameters                          | Return Type | Description                                                                 |
|-------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                  |                                     | void        | Calculates the viewport height and sets it for the chat window.             |
| handleCtrlPKeyPress     | event: KeyboardEvent                | void        | Handles the key press event for copying debug information to the clipboard. |
| copyLatestDebugInfoToClipboard |                                     | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback       |                                     | void        | Lifecycle method called when the element is added to the document.          |
| initWebSockets          |                                     | void        | Initializes the WebSocket connection for chat communication.                |
| sendHeartbeat           |                                     | void        | Sends a heartbeat message through the WebSocket to keep the connection alive.|
| onWsOpen                |                                     | void        | Callback for when the WebSocket connection is successfully opened.          |
| updated                 | changedProperties: Map              | void        | Lifecycle method called after the element’s properties have changed.        |
| handleScroll            |                                     | void        | Handles the scroll event in the chat messages window.                       |
| disconnectedCallback    |                                     | void        | Lifecycle method called when the element is removed from the document.      |
| onMessage               | event: MessageEvent                 | void        | Handles incoming WebSocket messages.                                        |
| scrollDown              |                                     | void        | Scrolls the chat messages window down to the latest message.                |
| addUserChatBotMessage   | userMessage: string                 | void        | Adds a user message to the chat log.                                        |
| addThinkingChatBotMessage |                                     | void        | Adds a "thinking" message to the chat log.                                  |
| addToChatLogWithMessage | data: PsAiChatWsMessage, ...        | void        | Adds a message to the chat log with optional parameters.                    |
| addChatBotElement       | wsMessage: PsAiChatWsMessage        | void        | Processes and adds a chatbot message to the chat log.                       |
| addChatUserElement      | data: PsAiChatWsMessage             | void        | Adds a user message element to the chat log.                                |
| sendChatMessage         |                                     | Promise<void> | Sends the current chat message through the WebSocket.                       |
| simplifiedChatLog       |                                     | PsSimpleChatLog[] | Returns a simplified version of the chat log.                              |
| followUpQuestion        | event: CustomEvent                  | void        | Handles the selection of a follow-up question.                              |
| reset                   |                                     | void        | Resets the chat assistant to its initial state.                             |
| toggleDarkMode          |                                     | void        | Toggles the dark mode theme for the chat assistant.                         |
| renderChatInput         |                                     | TemplateResult | Renders the chat input field.                                               |
| cancelSourceDialog      |                                     | void        | Cancels the source document dialog.                                         |
| openSourceDialog        | event: CustomEvent                  | void        | Opens the source document dialog with the selected document.                |
| stripDomainForFacIcon   | url: string                         | string      | Extracts the domain from a URL for fetching the favicon.                    |
| renderSourceDialog      |                                     | TemplateResult | Renders the dialog for displaying source document information.              |

## Events

No custom events are documented.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-chat-assistant.js';

// Example of using the PsChatAssistant in a LitElement component
class MyCustomElement extends LitElement {
  render() {
    return html`
      <ps-chat-assistant></ps-chat-assistant>
    `;
  }
}
customElements.define('my-custom-element', MyCustomElement);
```

This example demonstrates how to include the `PsChatAssistant` component in a custom element using LitElement. The `PsChatAssistant` component provides a chat interface that can be easily integrated into web applications for engaging with an AI chatbot or similar services.