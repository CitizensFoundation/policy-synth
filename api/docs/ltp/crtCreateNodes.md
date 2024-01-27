# crtCreateNodes

This module provides functionality for creating nodes in a Current Reality Tree (CRT) using the Logical Thinking Process. It interacts with the OpenAI API to generate potential causes for undesirable effects (UDEs) and constructs nodes based on the responses.

## Methods

| Name                | Parameters                                                                                   | Return Type                                  | Description                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| renderSystemPrompt  | causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string                                       | Generates the system prompt for the OpenAI API based on the current node and its parent nodes. |
| renderUserPrompt    | currentRealityTree: LtpCurrentRealityTreeData, currentUDE: string, causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string                                       | Generates the user prompt for the OpenAI API based on the current reality tree and UDE.        |
| filterTopCauses     | parsedMessages: CrtPromptJson[]                                                              | CrtPromptJson[]                              | Filters and sorts the parsed messages from the OpenAI response to get the top causes.          |
| convertToNodes      | topCauses: CrtPromptJson[], nodeType: CrtNodeType, debug: CrtDebugData \| undefined          | LtpCurrentRealityTreeDataNode[]              | Converts the top causes into CRT nodes.                                                        |
| getParentNodes      | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | LtpCurrentRealityTreeDataNode[] \| undefined | Recursively finds and returns the parent nodes of a given node.                                |
| identifyCauses      | crt: LtpCurrentRealityTreeData, currentUDE: string, currentparentNode: LtpCurrentRealityTreeDataNode \| undefined | Promise<LtpCurrentRealityTreeDataNode[]>    | Identifies potential causes for a given UDE or node and returns the newly created nodes.       |

## Examples

```
// Example usage of crtCreateNodes
import { identifyCauses } from '@policysynth/api/ltp/crtCreateNodes.js';

const crt = {
  context: "Example context",
  nodes: [...],
};

const currentUDE = "Example Undesirable Effect";

identifyCauses(crt, currentUDE).then((nodes) => {
  console.log("Identified Nodes:", nodes);
});
```