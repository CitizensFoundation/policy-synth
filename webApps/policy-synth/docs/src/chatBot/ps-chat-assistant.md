# PsChatAssistant

The `PsChatAssistant` class is a web component that provides a chat interface for users to interact with a chatbot. It extends the `YpBaseElement` class and manages the chat log, WebSocket connection, and user input.

## Properties

| Name                   | Type                             | Description                                                                 |
|------------------------|----------------------------------|-----------------------------------------------------------------------------|
| chatLog                | PsAiChatWsMessage[]              | An array of chat messages exchanged with the chatbot.                       |
| infoMessage            | string                           | A message that provides information to the user.                            |
| wsClientId             | string                           | The client ID used for the WebSocket connection.                            |
| defaultInfoMessage     | string                           | The default message displayed by the chat assistant.                        |
| wsEndpoint             | string                           | The WebSocket endpoint URL.                                                 |
| ws                     | WebSocket                        | The WebSocket connection instance.                                          |
| inputIsFocused         | boolean                          | Indicates whether the chat input field is focused.                          |
| onlyUseTextField       | boolean                          | A flag to determine if only the text field should be used for input.        |
| clusterId              | number                           | The ID of the cluster where the chatbot is running.                         |
| userScrolled           | boolean                          | Indicates whether the user has manually scrolled the chat window.           |
| communityId            | number                           | The ID of the community associated with the chat.                           |
| textInputLabel         | string                           | The label for the chat input field.                                         |
| currentFollowUpQuestions | string                         | The current follow-up questions provided by the chatbot.                    |
| programmaticScroll     | boolean                          | Indicates if the scroll action was initiated programmatically.              |
| scrollStart            | number                           | The starting scroll position when the user begins to scroll.                |
| defaultDevWsPort       | number                           | The default WebSocket port used during development.                         |

## Methods

| Name                   | Parameters                      | Return Type | Description                                                                 |
|------------------------|---------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                 |                                 | void        | Calculates the viewport height and sets it for the chat window.             |
| handleCtrlPKeyPress    | event: KeyboardEvent            | void        | Handles the key press event to copy debug information to the clipboard.     |
| copyLatestDebugInfoToClipboard |                           | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback      |                                 | void        | Lifecycle method that is called when the component is added to the document.|
| initWebSockets         |                                 | void        | Initializes the WebSocket connection.                                       |
| sendHeartbeat          |                                 | void        | Sends a heartbeat message through the WebSocket connection.                 |
| onWsOpen               |                                 | void        | Callback for when the WebSocket connection is opened.                       |
| updated                | changedProperties: Map          | void        | Lifecycle method called after the component's properties have changed.      |
| handleScroll           |                                 | void        | Handles the scroll event in the chat messages element.                      |
| disconnectedCallback   |                                 | void        | Lifecycle method that is called when the component is removed from the document. |
| onMessage              | event: MessageEvent             | Promise<void> | Handles incoming WebSocket messages.                                       |
| scrollDown             |                                 | void        | Scrolls the chat messages element down to the latest message.               |
| addToChatLogWithMessage | data: PsAiChatWsMessage, ...   | void        | Adds a message to the chat log with additional options.                     |
| addChatBotElement      | data: PsAiChatWsMessage         | void        | Adds a chatbot message element to the chat log.                             |
| addChatUserElement     | data: PsAiChatWsMessage         | void        | Adds a user message element to the chat log.                                |
| sendChatMessage        |                                 | Promise<void> | Sends the user's chat message through the WebSocket connection.            |
| simplifiedChatLog      |                                 | PsSimpleChatLog[] | Returns a simplified version of the chat log.                              |
| followUpQuestion       | event: CustomEvent              | void        | Handles the follow-up question event.                                       |
| reset                  |                                 | void        | Resets the chat log and sends a reset message through the WebSocket.        |
| toggleDarkMode         |                                 | void        | Toggles the dark mode theme for the chat interface.                         |
| renderChatInput        |                                 | TemplateResult | Renders the chat input field.                                              |
| render                 |                                 | TemplateResult | Renders the chat assistant component.                                      |

## Events (if any)

- **theme-dark-mode**: Emitted when the dark mode theme is toggled.

## Examples

```typescript
// Example usage of the PsChatAssistant web component
<ps-chat-assistant></ps-chat-assistant>
```

Please note that the actual implementation of the `PsChatAssistant` class may require additional context, such as the definitions for `PsAiChatWsMessage`, `PsAgentStartWsOptions`, `PsAgentCompletedWsOptions`, and `PsSimpleChatLog`, which are not provided in the documentation above.