# LtpChatAssistant

The `LtpChatAssistant` class extends `PsChatAssistant` and is designed to assist users in identifying direct causes of issues within a Current Reality Tree (CRT). It interacts with users through a chat interface, allowing them to input causes and receive validation and suggestions.

## Properties

| Name                   | Type                                      | Description                                                                 |
|------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| crtData                | LtpCurrentRealityTreeData                 | The current reality tree data.                                              |
| nodeToAddCauseTo       | LtpCurrentRealityTreeDataNode             | The node in the CRT to which causes are being added.                        |
| defaultInfoMessage     | string                                    | The default message displayed by the chat assistant.                        |
| lastChainCompletedAsValid | boolean                               | Indicates if the last validation chain was completed as valid.              |
| lastCausesToValidate   | string[] \| undefined                     | The last set of causes that were submitted for validation.                  |
| lastValidatedCauses    | string[] \| undefined                     | The last set of causes that were validated.                                 |
| api                    | LtpServerApi                              | An instance of the `LtpServerApi` for server communication.                 |
| heartbeatInterval      | number \| undefined                       | The interval for sending heartbeat messages to the server.                  |

## Methods

| Name                   | Parameters                                | Return Type | Description                                                                 |
|------------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback      |                                           | void        | Lifecycle method that runs when the element is added to the DOM.            |
| addChatBotElement      | data: PsAiChatWsMessage                   | void        | Adds a chat bot element to the chat log based on the provided message data.  |
| sendChatMessage        |                                           | Promise<void> | Sends a chat message to the server and processes the response.             |
| validateSelectedChoices | event: CustomEvent                        | Promise<void> | Validates the selected choices from the chat interface.                    |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void> | Gets suggestions based on the validation results.                          |
| renderChatInput        |                                           | TemplateResult | Renders the chat input field.                                              |
| render                 |                                           | TemplateResult | Renders the chat assistant interface.                                      |

## Events (if any)

- **followup-question**: Emitted when a follow-up question is triggered from the chat element.
- **validate-selected-causes**: Emitted when selected causes are submitted for validation.

## Examples

```typescript
// Example usage of the LtpChatAssistant class
const chatAssistant = document.createElement('ltp-chat-assistant');
chatAssistant.crtData = { /* ... */ };
chatAssistant.nodeToAddCauseTo = { /* ... */ };
document.body.appendChild(chatAssistant);
```

Please note that the above example is a basic illustration of how to create and use the `LtpChatAssistant` class. In a real-world scenario, you would need to provide the necessary data and handle events appropriately.