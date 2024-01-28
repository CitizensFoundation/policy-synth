# PsChatAssistant

This class represents a chat assistant component built using LitElement. It is designed to interact with users by sending and receiving messages through a WebSocket connection. The component integrates with various Material Design components for UI elements and extends the `YpBaseElement` for common functionalities.

## Properties

| Name                  | Type                        | Description                                                                 |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------|
| chatLog               | PsAiChatWsMessage[]         | An array to store chat messages exchanged during the session.               |
| infoMessage           | string                      | A message to display information to the user.                               |
| wsClientId            | string                      | The client ID assigned by the WebSocket server.                             |
| webSocketsErrorCount  | number                      | A counter to track the number of WebSocket errors.                          |
| defaultInfoMessage    | string                      | The default message to display as the chat assistant's greeting.            |
| wsEndpoint            | string                      | The WebSocket endpoint URL.                                                 |
| ws                    | WebSocket                   | The WebSocket connection instance.                                          |
| inputIsFocused        | boolean                     | Indicates if the chat input field is focused.                               |
| onlyUseTextField      | boolean                     | A flag to determine if only the text field should be used for input.        |
| clusterId             | number                      | The ID of the cluster the chat is associated with.                          |
| userScrolled          | boolean                     | Indicates if the user has manually scrolled the chat window.                |
| communityId           | number                      | The ID of the community the chat is associated with.                        |
| textInputLabel        | string                      | The label for the chat input field.                                         |
| currentFollowUpQuestions | string                    | Stores the current follow-up questions.                                     |
| programmaticScroll    | boolean                     | Indicates if the scroll action was initiated programmatically.              |
| showCleanupButton     | boolean                     | Determines whether the cleanup button should be shown.                      |
| scrollStart           | number                      | The starting point of a scroll action.                                      |
| serverMemoryId        | string \| undefined         | The ID of the server memory associated with the chat session.               |
| defaultDevWsPort      | number                      | The default WebSocket port for development environments.                    |

## Methods

| Name                        | Parameters                          | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                      |                                     | void        | Calculates the viewport height and sets it for the chat window.             |
| handleCtrlPKeyPress         | event: KeyboardEvent                | void        | Handles the key press event for copying debug information to the clipboard. |
| copyLatestDebugInfoToClipboard |                                   | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback           |                                     | void        | Lifecycle method called when the element is added to the document.          |
| initWebSockets              |                                     | void        | Initializes the WebSocket connection.                                       |
| sendHeartbeat               |                                     | void        | Sends a heartbeat message through the WebSocket connection.                 |
| onWsOpen                    |                                     | void        | Callback for when the WebSocket connection is opened.                       |
| updated                     | changedProperties: Map              | void        | Lifecycle method called after the element’s properties have changed.        |
| handleScroll                |                                     | void        | Handles the scroll event of the chat messages element.                      |
| disconnectedCallback        |                                     | void        | Lifecycle method called when the element is removed from the document.      |
| onMessage                   | event: MessageEvent                 | Promise<void> | Handles incoming WebSocket messages.                                        |
| scrollDown                  |                                     | void        | Scrolls the chat messages element down.                                     |
| addUserChatBotMessage       | userMessage: string                 | void        | Adds a user message to the chat log.                                        |
| addThinkingChatBotMessage   |                                     | void        | Adds a thinking message to the chat log.                                    |
| addToChatLogWithMessage     | data: PsAiChatWsMessage, message?: string, changeButtonDisabledState?: boolean, changeButtonLabelTo?: string, refinedCausesSuggestions?: string[], rawMessage?: string | void | Adds a message to the chat log with optional parameters.                    |
| lastChatUiElement           |                                     | PsAiChatElement | Returns the last chat UI element.                                           |
| addChatBotElement           | wsMessage: PsAiChatWsMessage        | Promise<void> | Adds a chat bot message element based on the message type.                  |
| addChatUserElement          | data: PsAiChatWsMessage             | void        | Adds a chat user message element.                                           |
| sendChatMessage             |                                     | Promise<void> | Sends the chat message entered by the user.                                 |
| simplifiedChatLog           |                                     | PsSimpleChatLog[] | Returns a simplified version of the chat log.                               |
| followUpQuestion            | event: CustomEvent                  | void        | Handles the follow-up question event.                                       |
| reset                       |                                     | void        | Resets the chat assistant to its initial state.                             |
| toggleDarkMode              |                                     | void        | Toggles the dark mode theme.                                                |
| renderChatInput             |                                     | TemplateResult | Renders the chat input field.                                               |

## Events

This component does not explicitly define custom events in the provided documentation.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-chat-assistant.js';

// Example usage in a LitElement component
class MyComponent extends LitElement {
  render() {
    return html`
      <ps-chat-assistant></ps-chat-assistant>
    `;
  }
}
```

This example demonstrates how to import and use the `ps-chat-assistant` component within another LitElement component.