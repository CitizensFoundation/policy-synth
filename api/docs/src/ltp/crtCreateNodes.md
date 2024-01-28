# Module: crtCreateNodes

This module is designed to interact with an OpenAI model to generate and process nodes for a Current Reality Tree (CRT) based on user input and system prompts. It includes functions for rendering prompts, filtering and converting responses into nodes, and identifying causes within the CRT framework.

## Methods

| Name                  | Parameters                                                                                   | Return Type                                      | Description                                                                                   |
|-----------------------|----------------------------------------------------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------|
| renderSystemPrompt    | causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string                                           | Generates a system prompt for the OpenAI model based on the current node and its parent nodes.|
| renderUserPrompt      | currentRealityTree: LtpCurrentRealityTreeData, currentUDE: string, causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string                                           | Creates a user prompt reflecting the current state of the CRT, including the current UDE and node hierarchy. |
| filterTopCauses       | parsedMessages: CrtPromptJson[]                                                              | CrtPromptJson[]                                  | Filters and sorts the parsed messages from the OpenAI response to select the top causes based on confidence level. |
| convertToNodes        | topCauses: CrtPromptJson[], nodeType: CrtNodeType, debug: CrtDebugData \| undefined          | LtpCurrentRealityTreeDataNode[]                  | Converts the top causes into CRT nodes, assigning unique IDs and additional metadata.          |
| getParentNodes        | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | LtpCurrentRealityTreeDataNode[] \| undefined     | Recursively identifies and returns the parent nodes of a given node within the CRT.           |
| identifyCauses        | crt: LtpCurrentRealityTreeData, currentUDE: string, currentparentNode: LtpCurrentRealityTreeDataNode \| undefined | Promise<LtpCurrentRealityTreeDataNode[]>         | Orchestrates the process of generating system and user prompts, sending them to the OpenAI model, and processing the response to identify and create new CRT nodes. |

## Examples

```typescript
import { identifyCauses } from '@policysynth/apiltp/crtCreateNodes.js';
import { LtpCurrentRealityTreeData, LtpCurrentRealityTreeDataNode } from 'your-type-definitions';

// Example CRT data and current UDE
const crt: LtpCurrentRealityTreeData = {
  context: 'Example context',
  nodes: [
    // Your nodes here
  ],
};
const currentUDE = 'Example Undesirable Effect';

// Assuming currentparentNode is defined elsewhere
const currentparentNode: LtpCurrentRealityTreeDataNode | undefined = undefined;

// Call identifyCauses to generate new nodes based on the current state of the CRT
identifyCauses(crt, currentUDE, currentparentNode).then((newNodes) => {
  console.log('Newly identified causes as nodes:', newNodes);
});
```

This example demonstrates how to use the `identifyCauses` method to interact with the OpenAI model and generate new nodes for a Current Reality Tree based on a given context and undesirable effect.