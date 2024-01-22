# LtpChatAssistant

The `LtpChatAssistant` class extends `PsChatAssistant` and is designed to assist users in identifying direct causes of specific issues within a Current Reality Tree (CRT). It interacts with users through a chat interface, allowing them to input causes and receive feedback and validation.

## Properties

| Name                     | Type                                      | Description                                                                 |
|--------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| crtData                  | LtpCurrentRealityTreeData                 | The current reality tree data.                                              |
| nodeToAddCauseTo         | LtpCurrentRealityTreeDataNode             | The node in the CRT to which causes are being added.                        |
| defaultInfoMessage       | string                                    | The default informational message displayed to the user.                    |
| lastChainCompletedAsValid| boolean                                   | Indicates whether the last validation chain was completed as valid.         |
| chatElements             | LtpAiChatElement[] \| undefined           | An array of chat elements used in the chat interface.                       |
| lastCausesToValidate     | string[] \| undefined                     | The last set of causes that were submitted for validation.                  |
| lastValidatedCauses      | string[] \| undefined                     | The last set of causes that were validated.                                 |
| api                      | LtpServerApi                              | An instance of the `LtpServerApi` for server communication.                 |
| heartbeatInterval        | number \| undefined                       | The interval for sending heartbeat messages to the server.                  |
| defaultDevWsPort         | number                                    | The default WebSocket port for development purposes.                        |

## Methods

| Name                    | Parameters                                | Return Type | Description                                                                 |
|-------------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback       |                                           | void        | Lifecycle method that runs when the component is added to the DOM.          |
| addChatBotElement       | data: PsAiChatWsMessage                   | void        | Adds a chat bot element to the chat log based on the provided message data.  |
| sendChatMessage         |                                           | Promise<void>| Sends the user's chat message to the server for processing.                  |
| validateSelectedChoices | event: CustomEvent                        | Promise<void>| Validates the selected causes based on the user's choices.                   |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void>| Retrieves suggestions based on the validation results.                      |
| renderChatInput         |                                           | TemplateResult | Renders the chat input field.                                              |
| render                  |                                           | TemplateResult | Renders the chat interface.                                                |

## Events (if any)

- **followup-question**: Emitted when a follow-up question is asked by the chat bot.
- **validate-selected-causes**: Emitted when selected causes are submitted for validation.

## Examples

```typescript
// Example usage of the LtpChatAssistant class
const chatAssistant = new LtpChatAssistant();
document.body.appendChild(chatAssistant);
```

Note: The example provided is a basic illustration of how to instantiate and append the `LtpChatAssistant` to the DOM. In a real-world scenario, additional setup and interaction with the component's API would be required.