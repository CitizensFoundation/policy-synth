# PsChatAssistant

This class represents a chat assistant component built using LitElement. It is designed to interact with users by sending and receiving messages through a WebSocket connection. The component integrates with Material Web Components and custom elements to provide a rich user interface for chat interactions.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| chatLog               | PsAiChatWsMessage[]                       | An array of chat messages exchanged during the session.                     |
| infoMessage           | string                                    | A message providing information or feedback to the user.                    |
| wsClientId            | string                                    | The client ID assigned to the WebSocket connection.                         |
| webSocketsErrorCount  | number                                    | A counter for WebSocket connection errors.                                  |
| defaultInfoMessage    | string                                    | The default message displayed by the chat assistant.                        |
| wsEndpoint            | string                                    | The WebSocket endpoint URL.                                                 |
| ws                    | WebSocket                                 | The WebSocket connection instance.                                          |
| inputIsFocused        | boolean                                   | Indicates whether the chat input field is focused.                          |
| onlyUseTextField      | boolean                                   | A flag to determine if only the text field should be used for input.        |
| clusterId             | number                                    | The cluster ID associated with the chat session.                            |
| userScrolled          | boolean                                   | Indicates whether the user has manually scrolled the chat window.           |
| communityId           | number                                    | The community ID associated with the chat session.                          |
| textInputLabel        | string                                    | The label for the chat input field.                                         |
| currentFollowUpQuestions | string                                  | The current follow-up questions provided by the chat assistant.             |
| programmaticScroll    | boolean                                   | Indicates if the scroll action was initiated programmatically.              |
| scrollStart           | number                                    | The starting point of a scroll action.                                      |
| defaultDevWsPort      | number                                    | The default WebSocket port used during development.                         |

## Methods

| Name                        | Parameters                             | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                      |                                        | void        | Calculates the viewport height and sets it for the chat window.             |
| handleCtrlPKeyPress         | event: KeyboardEvent                   | void        | Handles the key press event for copying debug information to the clipboard. |
| copyLatestDebugInfoToClipboard |                                      | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback           |                                        | void        | Lifecycle callback that runs when the element is added to the document.     |
| initWebSockets              |                                        | void        | Initializes the WebSocket connection.                                       |
| sendHeartbeat               |                                        | void        | Sends a heartbeat message through the WebSocket connection.                 |
| onWsOpen                    |                                        | void        | Callback for when the WebSocket connection is opened.                       |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs when the element's properties change.          |
| handleScroll                |                                        | void        | Handles the scroll event for the chat messages element.                     |
| disconnectedCallback        |                                        | void        | Lifecycle callback that runs when the element is removed from the document. |
| onMessage                   | event: MessageEvent                    | Promise<void> | Handles incoming WebSocket messages.                                        |
| scrollDown                  |                                        | void        | Scrolls the chat messages element to the bottom.                            |
| addUserChatBotMessage       | userMessage: string                    | void        | Adds a user message to the chat log.                                        |
| addThinkingChatBotMessage   |                                        | void        | Adds a "thinking" message to the chat log.                                  |
| addToChatLogWithMessage     | data: PsAiChatWsMessage, message?: string, changeButtonDisabledState?: boolean, changeButtonLabelTo?: string, refinedCausesSuggestions?: string[], rawMessage?: string | void | Adds a message to the chat log with additional options.                     |
| addChatBotElement           | data: PsAiChatWsMessage                | void        | Adds a chat bot element to the chat log.                                    |
| addChatUserElement          | data: PsAiChatWsMessage                | void        | Adds a chat user element to the chat log.                                   |
| sendChatMessage             |                                        | Promise<void> | Sends the current chat message.                                             |
| simplifiedChatLog           |                                        | PsSimpleChatLog[] | Returns a simplified version of the chat log.                               |
| followUpQuestion            | event: CustomEvent                     | void        | Handles follow-up questions from the chat bot.                              |
| reset                       |                                        | void        | Resets the chat log and updates the component.                              |
| toggleDarkMode              |                                        | void        | Toggles the dark mode theme for the chat interface.                         |
| renderChatInput             |                                        | TemplateResult | Renders the chat input field.                                               |

## Events

No events documented.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-chat-assistant.js';

// Example of using the PsChatAssistant element in a LitElement component
class MyComponent extends LitElement {
  render() {
    return html`
      <ps-chat-assistant></ps-chat-assistant>
    `;
  }
}
customElements.define('my-component', MyComponent);
```

This example demonstrates how to include the `ps-chat-assistant` custom element in a LitElement-based component.