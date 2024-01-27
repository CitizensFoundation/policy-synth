# LtpChatAssistant

`LtpChatAssistant` extends `PsChatAssistant` to provide a specialized chat assistant for interacting with Current Reality Trees (CRT). It manages chat interactions, processes messages, and integrates with an AI backend for message validation and suggestions.

## Properties

| Name                    | Type                                            | Description                                                                                   |
|-------------------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------|
| crtData                 | `LtpCurrentRealityTreeData`                     | The current reality tree data associated with the chat session.                               |
| nodeToAddCauseTo        | `LtpCurrentRealityTreeDataNode`                 | The node within the CRT to which causes are being added.                                      |
| defaultInfoMessage      | `string`                                        | The default informational message displayed by the chat assistant.                            |
| lastChainCompletedAsValid | `boolean`                                     | Indicates whether the last validation chain completed was valid.                              |
| chatElements            | `LtpAiChatElement[] \| undefined`               | The chat elements currently displayed in the chat interface.                                  |
| lastCausesToValidate    | `string[] \| undefined`                         | The last set of causes submitted for validation.                                              |
| lastValidatedCauses     | `string[] \| undefined`                         | The last set of causes that were validated successfully.                                      |
| api                     | `LtpServerApi`                                  | An instance of `LtpServerApi` for interacting with the server API.                            |
| heartbeatInterval       | `number \| undefined`                           | The interval at which heartbeat messages are sent to keep the connection alive.               |
| defaultDevWsPort        | `number`                                        | The default WebSocket port used in development environments.                                  |

## Methods

| Name                    | Parameters                                      | Return Type | Description                                                                                   |
|-------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback       |                                                 | `void`      | Overrides the connected callback to append the node description to the default info message. |
| addChatBotElement       | `data: PsAiChatWsMessage`                       | `void`      | Processes and adds a chat bot element based on the provided message data.                    |
| sendChatMessage         |                                                 | `Promise<void>` | Sends the current chat message to the backend for processing.                                |
| validateSelectedChoices | `event: CustomEvent`                            | `Promise<void>` | Validates the selected causes based on user input.                                           |
| getSuggestionsFromValidation | `agentName: string, validationResults: PsValidationAgentResult` | `Promise<void>` | Processes validation results and requests refined cause suggestions.                         |
| renderChatInput         |                                                 | `TemplateResult` | Renders the chat input field.                                                                |
| render                  |                                                 | `TemplateResult` | Renders the chat interface, including messages and the input field.                          |

## Events

No custom events are documented.

## Example

```typescript
import '@policysynth/webapp/ltp/chat/ltp-chat-assistant.js';

// Usage within a LitElement component
render() {
  return html`
    <ltp-chat-assistant
      .crtData=${this.crtData}
      .nodeToAddCauseTo=${this.nodeToAddCauseTo}
    ></ltp-chat-assistant>
  `;
}
```

This example demonstrates how to embed the `LtpChatAssistant` within a LitElement component, passing the current reality tree data and the specific node to which causes are being added.