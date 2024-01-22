# PsChatAssistant

PsChatAssistant is a custom web component that acts as a chat interface for interacting with a chatbot. It manages the chat log, user input, and communication with a WebSocket server to send and receive messages.

## Properties

| Name                  | Type                          | Description                                           |
|-----------------------|-------------------------------|-------------------------------------------------------|
| chatLog               | PsAiChatWsMessage[]           | An array of chat messages exchanged in the session.   |
| infoMessage           | string                        | A message providing information to the user.          |
| wsClientId            | string                        | The client ID for the WebSocket connection.           |
| defaultInfoMessage    | string                        | The default message displayed by the chat assistant.  |
| wsEndpoint            | string                        | The WebSocket endpoint URL.                           |
| ws                    | WebSocket                     | The WebSocket connection instance.                    |
| inputIsFocused        | boolean                       | Indicates if the chat input is focused.               |
| clusterId             | number                        | The cluster ID associated with the chat session.      |
| userScrolled          | boolean                       | Indicates if the user has scrolled the chat window.   |
| communityId           | number                        | The community ID associated with the chat session.    |
| textInputLabel        | string                        | The label for the chat input field.                   |
| currentFollowUpQuestions | string                    | The current follow-up questions in the chat.          |
| programmaticScroll    | boolean                       | Indicates if the scroll was initiated programmatically. |
| scrollStart           | number                        | The starting point of a scroll action.                |
| defaultDevWsPort      | number                        | The default WebSocket port for development.           |

## Methods

| Name                   | Parameters                   | Return Type | Description                                      |
|------------------------|------------------------------|-------------|--------------------------------------------------|
| calcVH                 | -                            | void        | Calculates the viewport height for the chat window. |
| handleCtrlPKeyPress    | event: KeyboardEvent         | void        | Handles the key press event for debug actions.   |
| copyLatestDebugInfoToClipboard | -                    | void        | Copies the latest debug information to the clipboard. |
| connectedCallback      | -                            | void        | Lifecycle method called when the component is added to the DOM. |
| initWebSockets         | -                            | void        | Initializes the WebSocket connection.            |
| sendHeartbeat          | -                            | void        | Sends a heartbeat message through the WebSocket. |
| onWsOpen               | -                            | void        | Handler for when the WebSocket connection opens. |
| updated                | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component updates. |
| handleScroll           | -                            | void        | Handles the scroll event in the chat messages element. |
| disconnectedCallback   | -                            | void        | Lifecycle method called when the component is removed from the DOM. |
| onMessage              | event: MessageEvent          | Promise<void> | Handles incoming WebSocket messages.          |
| scrollDown             | -                            | void        | Scrolls the chat messages element down.          |
| addToChatLogWithMessage | data: PsAiChatWsMessage, message?: string, changeButtonDisabledState?: boolean, changeButtonLabelTo?: string, refinedCausesSuggestions?: string[], rawMessage?: string | void | Adds a message to the chat log with additional options. |
| addChatBotElement      | data: PsAiChatWsMessage      | void        | Adds a chat bot element to the chat log.         |
| addChatUserElement     | data: PsAiChatWsMessage      | void        | Adds a chat user element to the chat log.        |
| sendChatMessage        | -                            | Promise<void> | Sends the user's chat message.                 |
| followUpQuestion       | event: CustomEvent           | void        | Handles a follow-up question event.             |
| reset                  | -                            | void        | Resets the chat session.                         |
| toggleDarkMode         | -                            | void        | Toggles the dark mode theme.                     |
| renderChatInput        | -                            | TemplateResult | Renders the chat input field.                 |

## Events

- **theme-dark-mode**: Emitted when the dark mode theme is toggled.

## Examples

```typescript
// Example usage of the PsChatAssistant component
const chatAssistant = document.createElement('ps-chat-assistant');
document.body.appendChild(chatAssistant);

// To send a message programmatically
chatAssistant.sendChatMessage();
```

Please note that the actual implementation of the `PsAiChatWsMessage`, `PsAgentStartWsOptions`, `PsAgentCompletedWsOptions`, and other custom types or interfaces used in the component are not provided in the documentation. They should be documented separately based on their definitions.