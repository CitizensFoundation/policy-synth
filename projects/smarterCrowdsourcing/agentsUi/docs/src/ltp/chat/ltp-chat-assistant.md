# LtpChatAssistant

`LtpChatAssistant` extends `PsChatAssistant` to provide a specialized chat assistant for interacting with Current Reality Trees (CRTs). It integrates with AI chat elements to facilitate the identification and validation of causes within a CRT context.

## Properties

| Name                   | Type                                  | Description                                                                                      |
|------------------------|---------------------------------------|--------------------------------------------------------------------------------------------------|
| crtData                | LtpCurrentRealityTreeData             | Holds the current reality tree data.                                                             |
| nodeToAddCauseTo       | LtpCurrentRealityTreeDataNode         | The node within the CRT to which causes are being added.                                         |
| defaultInfoMessage     | string                                | The default message displayed by the chat assistant.                                             |
| lastChainCompletedAsValid | Boolean                           | Indicates if the last validation chain completed was valid.                                      |
| lastCausesToValidate   | string[] \| undefined                 | The last set of causes that were sent for validation.                                            |
| lastValidatedCauses    | string[] \| undefined                 | The last set of causes that were validated successfully.                                         |
| api                    | LtpServerApi                          | An instance of `LtpServerApi` for making API calls.                                              |
| heartbeatInterval      | number \| undefined                   | An interval for maintaining the connection's heartbeat.                                           |
| defaultDevWsPort       | number                                | The default WebSocket port used in development.                                                   |

## Methods

| Name                    | Parameters                          | Return Type | Description                                                                                       |
|-------------------------|-------------------------------------|-------------|---------------------------------------------------------------------------------------------------|
| connectedCallback       |                                     | void        | Overrides the connected callback to append the node description to the default info message.      |
| addChatBotElement       | data: PsAiChatWsMessage             | Promise<void> | Adds a chat bot element based on the provided message data.                                       |
| sendChatMessage         |                                     | Promise<void> | Sends a chat message, processes it, and interacts with the API based on the message content.      |
| validateSelectedChoices | event: CustomEvent                  | Promise<void> | Validates the selected causes based on the event details.                                         |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void> | Processes validation results and sends a query for refined cause suggestions.                     |
| renderChatInput         |                                     | TemplateResult | Renders the chat input field with appropriate configuration based on the chat log length.         |
| render                  |                                     | TemplateResult | Renders the chat window, including messages and the chat input field.                             |

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
customElements.define('my-custom-element', MyCustomElement);
```

This example demonstrates how to integrate the `LtpChatAssistant` into a custom LitElement, providing it with the necessary `crtData` and `nodeToAddCauseTo` properties for operation.