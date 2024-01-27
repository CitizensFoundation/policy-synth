# PsChatAssistant

This class represents a chat assistant component built using LitElement. It is designed to interact with users through a chat interface, providing responses from a chatbot and handling user inputs. The component integrates with web sockets for real-time communication and supports various UI elements from the Material Web Components library.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| chatLog               | PsAiChatWsMessage[]                       | An array to store chat messages between the user and the chatbot.           |
| infoMessage           | string                                    | A message to display additional information to the user.                    |
| wsClientId            | string                                    | The client ID used for identifying the WebSocket connection.                |
| webSocketsErrorCount  | number                                    | A counter to track the number of WebSocket errors.                          |
| defaultInfoMessage    | string                                    | The default message to display when the chat assistant is initialized.      |
| wsEndpoint            | string                                    | The WebSocket endpoint URL for establishing the connection.                 |
| ws                    | WebSocket                                 | The WebSocket object used for communication.                                |
| inputIsFocused        | boolean                                   | A flag to indicate if the chat input field is focused.                      |
| onlyUseTextField      | boolean                                   | A flag to determine if only the text field should be used for input.        |
| clusterId             | number                                    | The ID of the cluster where the chat assistant is deployed.                 |
| userScrolled          | boolean                                   | A flag to indicate if the user has manually scrolled the chat window.       |
| communityId           | number                                    | The ID of the community associated with the chat session.                   |
| textInputLabel        | string                                    | The label for the chat input field.                                         |
| currentFollowUpQuestions | string                                  | A string to store current follow-up questions.                              |
| programmaticScroll    | boolean                                   | A flag to indicate if scrolling is initiated programmatically.              |
| scrollStart           | number                                    | The starting point of a scroll action.                                      |
| defaultDevWsPort      | number                                    | The default WebSocket port used during development.                         |

## Methods

| Name                        | Parameters                             | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------|-------------|-----------------------------------------------------------------------------|
| calcVH                      |                                        | void        | Calculates the viewport height and sets it for the chat window.             |
| handleCtrlPKeyPress         | event: KeyboardEvent                   | void        | Handles the key press event for copying debug information to the clipboard. |
| copyLatestDebugInfoToClipboard |                                      | void        | Copies the latest debug information to the clipboard.                       |
| connectedCallback           |                                        | void        | Lifecycle method called when the element is added to the document.          |
| initWebSockets              |                                        | void        | Initializes the WebSocket connection.                                       |
| sendHeartbeat               |                                        | void        | Sends a heartbeat message through the WebSocket.                            |
| onWsOpen                    |                                        | void        | Callback for when the WebSocket connection is opened.                       |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element’s properties have changed.        |
| handleScroll                |                                        | void        | Handles the scroll event in the chat messages element.                      |
| disconnectedCallback        |                                        | void        | Lifecycle method called when the element is removed from the document.      |
| onMessage                   | event: MessageEvent                    | Promise<void> | Handles incoming WebSocket messages.                                        |
| scrollDown                  |                                        | void        | Scrolls the chat messages element down to the latest message.               |
| addUserChatBotMessage       | userMessage: string                    | void        | Adds a user message to the chat log.                                        |
| addThinkingChatBotMessage   |                                        | void        | Adds a "thinking" message to the chat log.                                  |
| addToChatLogWithMessage     | data: PsAiChatWsMessage, message?: string, changeButtonDisabledState?: boolean, changeButtonLabelTo?: string, refinedCausesSuggestions?: string[], rawMessage?: string | void | Adds a message to the chat log with optional parameters.                    |
| addChatBotElement           | data: PsAiChatWsMessage                | void        | Adds a chatbot message element to the chat log.                             |
| addChatUserElement          | data: PsAiChatWsMessage                | void        | Adds a user message element to the chat log.                                |
| sendChatMessage             |                                        | Promise<void> | Sends the user's chat message through the WebSocket.                        |
| simplifiedChatLog           |                                        | PsSimpleChatLog[] | Returns a simplified version of the chat log.                               |
| followUpQuestion            | event: CustomEvent                     | void        | Handles follow-up questions from chat elements.                             |
| reset                       |                                        | void        | Resets the chat log and updates the component.                              |
| toggleDarkMode              |                                        | void        | Toggles the dark mode theme for the chat assistant.                         |
| renderChatInput             |                                        | TemplateResult | Renders the chat input field based on the current state.                    |

## Events

No events documented.

## Example

```typescript
import { PsChatAssistant } from '@policysynth/webapp/chatBot/ps-chat-assistant.js';

// Example usage of PsChatAssistant
const chatAssistant = document.createElement('ps-chat-assistant');
document.body.appendChild(chatAssistant);

// Example WebSocket message sending
chatAssistant.sendChatMessage();
```

This example demonstrates how to create an instance of `PsChatAssistant` and append it to the document body. It also shows how to send a chat message using the `sendChatMessage` method.