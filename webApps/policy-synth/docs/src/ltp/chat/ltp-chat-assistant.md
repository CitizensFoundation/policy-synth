# LtpChatAssistant

`LtpChatAssistant` extends `PsChatAssistant` to provide a chat interface for interacting with a Current Reality Tree (CRT) assistant. It facilitates the identification of direct causes related to a specific node within the CRT and manages the chat interaction, including sending messages, displaying chat elements, and handling validation of causes.

## Properties

| Name                   | Type                                      | Description                                                                                   |
|------------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| crtData                | LtpCurrentRealityTreeData                 | Holds the current reality tree data.                                                          |
| nodeToAddCauseTo       | LtpCurrentRealityTreeDataNode             | The node within the CRT to which causes are being added.                                      |
| defaultInfoMessage     | string                                    | The default message displayed by the chat assistant.                                          |
| lastChainCompletedAsValid | boolean                               | Indicates if the last validation chain was completed as valid.                                |
| lastCausesToValidate   | string[] \| undefined                     | The last set of causes that were sent for validation.                                         |
| lastValidatedCauses    | string[] \| undefined                     | The last set of causes that were validated successfully.                                      |
| api                    | LtpServerApi                              | An instance of `LtpServerApi` for making API calls.                                           |
| heartbeatInterval      | number \| undefined                       | Interval ID for the heartbeat mechanism (not used in the provided code).                      |
| defaultDevWsPort       | number                                    | The default WebSocket port for development purposes.                                          |

## Methods

| Name                    | Parameters                              | Return Type | Description                                                                                   |
|-------------------------|-----------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback       |                                         | void        | Extends the `connectedCallback` from `PsChatAssistant` to append the node description to the default info message. |
| addChatBotElement       | data: PsAiChatWsMessage                 | void        | Adds a chat element based on the message data received.                                       |
| sendChatMessage         |                                         | Promise<void> | Sends the chat message entered by the user.                                                  |
| validateSelectedChoices | event: CustomEvent                      | Promise<void> | Validates the selected causes based on the user's selection.                                 |
| getSuggestionsFromValidation | agentName: string, validationResults: PsValidationAgentResult | Promise<void> | Processes validation results and sends a query for refined causes.                           |
| renderChatInput         |                                         | TemplateResult | Renders the chat input field.                                                                 |
| render                  |                                         | TemplateResult | Renders the chat interface, including messages and the input field.                          |

## Example

```typescript
import { LtpChatAssistant } from '@policysynth/webapp/ltp/chat/ltp-chat-assistant.js';

// Assuming you have a lit-element setup to incorporate the LtpChatAssistant
// Below is a hypothetical example of how you might use LtpChatAssistant in your HTML

<ltp-chat-assistant
  .crtData=${this.crtData}
  .nodeToAddCauseTo=${this.selectedNode}
></ltp-chat-assistant>

// Note: `this.crtData` and `this.selectedNode` should be defined in your component,
// representing the current reality tree data and the selected node to add causes to, respectively.
```

This example demonstrates how to incorporate the `LtpChatAssistant` into a LitElement-based web application. It assumes that `crtData` and `selectedNode` are properties of your component that hold the relevant Current Reality Tree data and the node to which causes are being added.