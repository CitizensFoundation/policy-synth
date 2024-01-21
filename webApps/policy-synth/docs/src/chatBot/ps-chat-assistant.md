# PsChatAssistant

The `PsChatAssistant` class is a custom web component that acts as a chat assistant, providing a user interface for sending and receiving messages through a WebSocket connection. It extends the `YpBaseElement` class and includes various properties, methods, and event handlers to manage the chat functionality.

## Properties

| Name                     | Type                                  | Description                                                                 |
|--------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| chatLog                  | PsAiChatWsMessage[]                   | An array of chat messages.                                                  |
| infoMessage              | string                                | A message that provides information to the user.                            |
| wsClientId               | string                                | The client ID for the WebSocket connection.                                 |
| defaultInfoMessage       | string                                | The default message displayed by the chat assistant.                        |
| wsEndpoint               | string                                | The WebSocket endpoint URL.                                                 |
| ws                       | WebSocket                             | The WebSocket connection instance.                                          |
| inputIsFocused           | boolean                               | Indicates whether the chat input is focused.                                |
| clusterId                | number                                | The cluster ID associated with the chat session.                            |
| userScrolled             | boolean                               | Indicates whether the user has scrolled the chat window.                    |
| communityId              | number                                | The community ID associated with the chat session.                          |
| textInputLabel           | string                                | The label for the chat input field.                                         |
| currentFollowUpQuestions | string                                | The current follow-up questions available to the user.                      |
| programmaticScroll       | boolean                               | Indicates whether the scroll event was initiated programmatically.          |
| scrollStart              | number                                | The starting scroll position when the user begins to scroll.                |

## Methods

| Name                     | Parameters                            | Return Type | Description                                                                 |
|--------------------------|---------------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                   |                                       | void        | Calculates the viewport height and sets the chat window height accordingly. |
| handleCtrlPKeyPress      | event: KeyboardEvent                  | void        | Handles the key press event for copying debug information to the clipboard. |
| copyLatestDebugInfoToClipboard |                                 | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback        |                                       | void        | Lifecycle method called when the element is added to the document.          |
| initWebSockets           |                                       | void        | Initializes the WebSocket connection.                                       |
| firstUpdated             | _changedProperties: PropertyValueMap<any> \| Map<PropertyKey, unknown> | void | Lifecycle method called after the element's first render.                  |
| sendHeartbeat            |                                       | void        | Sends a heartbeat message through the WebSocket connection.                 |
| onWsOpen                 |                                       | void        | Handler for the WebSocket 'open' event.                                     |
| updated                  | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element's properties have changed.       |
| handleScroll             |                                       | void        | Handles the scroll event for the chat messages element.                     |
| disconnectedCallback     |                                       | void        | Lifecycle method called when the element is removed from the document.      |
| onMessage                | event: MessageEvent                   | void        | Handler for the WebSocket 'message' event.                                  |
| scrollDown               |                                       | void        | Scrolls the chat messages element down to the latest message.               |
| addToChatLogWithMessage  | data: PsAiChatWsMessage, message?: string, changeButtonDisabledState?: boolean, changeButtonLabelTo?: string, refinedCausesSuggestions?: string[], rawMessage?: string | void | Adds a message to the chat log with optional parameters.                    |
| addChatBotElement        | data: PsAiChatWsMessage               | void        | Adds a chat bot element to the chat log.                                    |
| addChatUserElement       | data: PsAiChatWsMessage               | void        | Adds a chat user element to the chat log.                                   |
| sendChatMessage          |                                       | Promise<void> | Sends the chat message entered by the user.                                 |
| followUpQuestion         | event: CustomEvent                    | void        | Handles the follow-up question event.                                       |
| reset                    |                                       | void        | Resets the chat log and sends a reset message through the WebSocket.        |
| toggleDarkMode           |                                       | void        | Toggles the dark mode theme for the chat interface.                         |
| renderChatInput          |                                       | TemplateResult | Renders the chat input field.                                               |

## Events

- **theme-dark-mode**: Emitted when the dark mode theme is toggled.

## Examples

```typescript
// Example usage of the PsChatAssistant web component
<ps-chat-assistant
  ws-endpoint="wss://example.com/chat"
  cluster-id="123"
  community-id="456"
></ps-chat-assistant>
```

Note: The `PsAiChatWsMessage`, `PsAgentStartWsOptions`, `PsAgentCompletedWsOptions`, and other custom types used in the properties and methods are not defined in the provided documentation and should be documented separately.