# LtpChatAssistant

`LtpChatAssistant` extends `PsChatAssistant` to provide a specialized chat assistant for interacting with Current Reality Trees (CRT). It manages chat interactions, processes messages, and integrates with an AI backend for message validation and suggestions.

## Properties

| Name                   | Type                             | Description                                                                 |
|------------------------|----------------------------------|-----------------------------------------------------------------------------|
| crtData                | LtpCurrentRealityTreeData       | The current reality tree data.                                              |
| nodeToAddCauseTo       | LtpCurrentRealityTreeDataNode   | The node in the CRT to which causes are being added.                        |
| defaultInfoMessage     | string                           | The default informational message displayed by the chat assistant.          |
| lastChainCompletedAsValid | Boolean                        | Indicates if the last validation chain completed was valid.                 |
| lastCausesToValidate   | string[] \| undefined            | The last set of causes submitted for validation.                            |
| lastValidatedCauses    | string[] \| undefined            | The last set of causes that were validated successfully.                    |
| api                    | LtpServerApi                     | An instance of `LtpServerApi` for backend communication.                    |
| heartbeatInterval      | number \| undefined              | The interval for sending heartbeat messages to keep the connection alive.   |
| defaultDevWsPort       | number                           | The default WebSocket port used in development.                             |

## Methods

| Name                    | Parameters                        | Return Type | Description                                                                 |
|-------------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback       |                                   | void        | Extends the base `connectedCallback` to append node description to the default info message. |
| addChatBotElement       | data: PsAiChatWsMessage           | Promise<void> | Processes and adds a chat bot element based on the provided message data.  |
| sendChatMessage         |                                   | Promise<void> | Sends a chat message entered by the user.                                  |
| validateSelectedChoices | event: CustomEvent                | Promise<void> | Validates the selected choices from a custom event.                        |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void> | Processes validation results and requests refined cause suggestions.       |
| renderChatInput         |                                   | TemplateResult | Renders the chat input field.                                               |
| render                  |                                   | TemplateResult | Renders the chat assistant UI.                                              |

## Example

```typescript
import '@policysynth/webapp/ltp/chat/ltp-chat-assistant.js';

// Usage within a LitElement
class MyCustomElement extends LitElement {
  render() {
    return html`
      <ltp-chat-assistant
        .crtData=${this.crtData}
        .nodeToAddCauseTo=${this.nodeToAddCauseTo}
      ></ltp-chat-assistant>
    `;
  }
}
```

This example demonstrates how to integrate the `LtpChatAssistant` into a custom LitElement, passing in the necessary properties for the Current Reality Tree data and the node to which causes are being added.