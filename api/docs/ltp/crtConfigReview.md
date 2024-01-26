# Module: crtConfigReview

This module is designed to interact with the OpenAI API to generate and review Current Reality Tree (CRT) configurations using a Logical Thinking Process assistant. It provides functionality to render user and system prompts, and to initiate a configuration review process that communicates with the OpenAI API and streams the response back to the client over WebSocket.

## Methods

| Name                    | Parameters                                                                 | Return Type                     | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| renderUserPrompt        | crt: LtpCurrentRealityTreeData                                             | string                          | Generates a prompt for the user to review the Current Reality Tree data in markdown format.   |
| renderSystemPrompt      | -                                                                          | string                          | Generates a system prompt to guide the user in reviewing the Current Reality Tree data.      |
| getConfigurationReview  | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket> | Promise<void> | Initiates the review process for a Current Reality Tree configuration, streaming the response to the client. |

## Examples

```javascript
// Example usage of the crtConfigReview module
import { renderUserPrompt, renderSystemPrompt, getConfigurationReview } from '@policysynth/api/ltp/crtConfigReview.js';
import WebSocket from 'ws';

// Example data for Current Reality Tree
const crtData = {
  context: "Project XYZ",
  undesirableEffects: ["Increased costs", "Delayed delivery"]
};

// Example WebSocket clients map
const wsClients = new Map();
const clientId = "unique-client-id";
wsClients.set(clientId, new WebSocket('ws://example.com'));

// Rendering prompts
console.log(renderUserPrompt(crtData));
console.log(renderSystemPrompt());

// Initiating configuration review
getConfigurationReview(crtData, clientId, wsClients).then(() => {
  console.log("Configuration review process initiated.");
});
```

This example demonstrates how to use the `crtConfigReview` module to render prompts for reviewing a Current Reality Tree configuration and how to initiate the review process, streaming the response to a WebSocket client.