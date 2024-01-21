# LtpChatAssistant

The `LtpChatAssistant` class is a web component that acts as a chat interface for interacting with a Current Reality Tree (CRT) assistant. It facilitates the identification of direct causes of issues and provides a conversational interface for users to interact with an AI chatbot.

## Properties

| Name                      | Type                                      | Description                                                                                   |
|---------------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| chatLog                   | PsAiChatWsMessage[]                      | An array of chat messages exchanged in the chat interface.                                     |
| infoMessage               | string                                    | A message providing information to the user.                                                   |
| wsClientId                | string                                    | The client ID for the WebSocket connection.                                                    |
| crtData                   | LtpCurrentRealityTreeData                 | Data related to the current reality tree.                                                      |
| nodeToAddCauseTo          | LtpCurrentRealityTreeDataNode             | The node in the CRT to which causes are being added.                                           |
| defaultInfoMessage        | string                                    | The default message displayed by the chat assistant.                                           |
| wsEndpoint                | string                                    | The WebSocket endpoint URL.                                                                    |
| ws                        | WebSocket                                 | The WebSocket connection instance.                                                             |
| inputIsFocused            | boolean                                   | Indicates whether the chat input is focused.                                                   |
| clusterId                 | number                                    | The ID of the cluster associated with the chat.                                                |
| userScrolled              | boolean                                   | Indicates whether the user has manually scrolled the chat window.                              |
| communityId               | number                                    | The ID of the community associated with the chat.                                              |
| textInputLabel            | string                                    | The label for the chat input field.                                                            |
| lastChainCompletedAsValid | boolean                                   | Indicates whether the last validation chain completed successfully.                            |
| currentFollowUpQuestions  | string                                    | The current set of follow-up questions provided by the chatbot.                                |
| programmaticScroll        | boolean                                   | Indicates whether the current scroll event was initiated programmatically.                     |
| scrollStart               | number                                    | The starting scroll position when the user begins to scroll.                                   |
| lastCausesToValidate      | string[] \| undefined                     | The last set of causes that were submitted for validation.                                     |
| lastValidatedCauses       | string[] \| undefined                     | The last set of causes that were validated successfully.                                       |
| api                       | LtpServerApi                              | An instance of the `LtpServerApi` for making API calls.                                        |
| heartbeatInterval         | number \| undefined                       | The interval ID for the WebSocket heartbeat messages.                                          |

## Methods

| Name                     | Parameters                  | Return Type | Description                                                                                   |
|--------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------------------------|
| calcVH                   |                             | void        | Calculates the viewport height and sets it for the chat window.                               |
| handleCtrlPKeyPress      | event: KeyboardEvent        | void        | Handles the key press event for copying debug information to the clipboard.                   |
| copyLatestDebugInfoToClipboard |                             | void        | Copies the latest debug information to the clipboard.                                         |
| connectedCallback        |                             | void        | Lifecycle method called when the component is added to the DOM.                               |
| initWebSockets           |                             | void        | Initializes the WebSocket connection.                                                         |
| firstUpdated             | _changedProperties: PropertyValueMap<any> \| Map<PropertyKey, unknown> | void        | Lifecycle method called after the component's first render.                                   |
| sendHeartbeat            |                             | void        | Sends a heartbeat message over the WebSocket connection.                                      |
| onWsOpen                 |                             | void        | Callback for when the WebSocket connection is opened.                                          |
| updated                  | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method called after the component's properties have changed.                        |
| handleScroll             |                             | void        | Handles the scroll event for the chat messages element.                                       |
| disconnectedCallback     |                             | void        | Lifecycle method called when the component is removed from the DOM.                            |
| onMessage                | event: MessageEvent         | Promise<void> | Handles incoming WebSocket messages.                                                          |
| scrollDown               |                             | void        | Scrolls the chat messages element to the bottom.                                              |
| addToChatLogWithMessage  | data: PsAiChatWsMessage, message: string \| undefined, changeButtonDisabledState: boolean \| undefined, changeButtonLabelTo: string \| undefined, refinedCausesSuggestions: string[] \| undefined, rawMessage: string \| undefined | void        | Adds a message to the chat log with additional options.                                       |
| addChatBotElement        | data: PsAiChatWsMessage    | void        | Adds a chat bot element to the chat log.                                                      |
| addChatUserElement       | data: PsAiChatWsMessage    | void        | Adds a chat user element to the chat log.                                                     |
| sendChatMessage          |                             | Promise<void> | Sends a chat message to the server.                                                           |
| validateSelectedChoices  | event: CustomEvent          | Promise<void> | Validates the selected choices from the chat interface.                                       |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void> | Retrieves suggestions based on validation results.                                            |
| followUpQuestion         | event: CustomEvent          | void        | Handles a follow-up question event.                                                           |
| reset                    |                             | void        | Resets the chat log and sends a reset message over the WebSocket.                             |
| toggleDarkMode           |                             | void        | Toggles the dark mode theme for the chat interface.                                           |
| renderChatInput          |                             | TemplateResult | Renders the chat input field.                                                                 |
| render                   |                             | TemplateResult | Renders the chat interface.                                                                   |

## Events

- **theme-dark-mode**: Emitted when the dark mode theme is toggled.

## Examples

```typescript
// Example usage of the LtpChatAssistant web component
<ltp-chat-assistant
  .chatLog="${this.chatLog}"
  .infoMessage="${this.infoMessage}"
  .wsClientId="${this.wsClientId}"
  .crtData="${this.crtData}"
  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
  .wsEndpoint="${this.wsEndpoint}"
  .ws="${this.ws}"
  .inputIsFocused="${this.inputIsFocused}"
  .clusterId="${this.clusterId}"
  .userScrolled="${this.userScrolled}"
  .communityId="${this.communityId}"
  .textInputLabel="${this.textInputLabel}"
  .lastChainCompletedAsValid="${this.lastChainCompletedAsValid}"
  .currentFollowUpQuestions="${this.currentFollowUpQuestions}"
  .programmaticScroll="${this.programmaticScroll}"
  .scrollStart="${this.scrollStart}"
  .lastCausesToValidate="${this.lastCausesToValidate}"
  .lastValidatedCauses="${this.lastValidatedCauses}"
  .api="${this.api}"
  .heartbeatInterval="${this.heartbeatInterval}"
></ltp-chat-assistant>
```

Note: The `PsAiChatWsMessage`, `LtpCurrentRealityTreeData`, `LtpCurrentRealityTreeDataNode`, `LtpServerApi`, `PsAgentStartWsOptions`, `PsAgentCompletedWsOptions`, and `PsValidationAgentResult` types are assumed to be defined elsewhere in the codebase and are required for the proper functioning of the `LtpChatAssistant` component.