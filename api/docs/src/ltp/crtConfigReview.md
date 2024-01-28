# Module: crtConfigReview

This module is designed to interact with OpenAI's API to generate configuration reviews for a Current Reality Tree (CRT) in the context of the Logical Thinking Process (LTP). It utilizes WebSocket for real-time communication with clients.

## Methods

| Name                    | Parameters                                                                 | Return Type             | Description                                                                                      |
|-------------------------|----------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------------|
| renderUserPrompt        | crt: LtpCurrentRealityTreeData                                             | string                  | Generates a prompt for the user to review the Current Reality Tree context and undesirable effects. |
| renderSystemPrompt      |                                                                            | string                  | Generates a system prompt to guide the user in reviewing the Current Reality Tree setup.         |
| getConfigurationReview  | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket> | Promise<void> | Initiates the review process by sending prompts to OpenAI and streaming the response to the client. |

## Examples

```typescript
import { renderUserPrompt, renderSystemPrompt, getConfigurationReview } from '@policysynth/apiltp/crtConfigReview.js';
import WebSocket from 'ws';

// Example data for Current Reality Tree
const crtData = {
  context: "Project XYZ",
  undesirableEffects: ["Delayed delivery", "Budget overrun"]
};

// Example WebSocket clients map
const wsClients = new Map<string, WebSocket>();
const clientId = "unique-client-id";
wsClients.set(clientId, new WebSocket('ws://example.com'));

// Rendering prompts
console.log(renderUserPrompt(crtData));
console.log(renderSystemPrompt());

// Initiating configuration review
getConfigurationReview(crtData, clientId, wsClients).then(() => {
  console.log("Review process initiated.");
}).catch(error => {
  console.error("Error initiating review process:", error);
});
```

This example demonstrates how to use the `renderUserPrompt`, `renderSystemPrompt`, and `getConfigurationReview` methods to facilitate a review process of a Current Reality Tree using OpenAI's API and WebSocket for real-time communication.