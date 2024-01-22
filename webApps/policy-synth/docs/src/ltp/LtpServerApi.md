# LtpServerApi

The `LtpServerApi` class extends the `YpServerApi` class and provides methods to interact with the server's API for operations related to the Current Reality Tree (CRT) within the context of the LTP (Logical Thinking Process) framework.

## Properties

| Name         | Type   | Description                                   |
|--------------|--------|-----------------------------------------------|
| baseLtpPath  | string | The base path for LTP related API endpoints.  |
| baseUrlPath  | string | The base URL path for the API.                |

## Methods

| Name                    | Parameters                                                                 | Return Type                             | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| getCrt                  | groupId: number                                                            | Promise<LtpCurrentRealityTreeData>      | Fetches the current reality tree for a given group ID.                                        |
| createTree              | crt: LtpCurrentRealityTreeData                                             | Promise<LtpCurrentRealityTreeData>      | Creates a new current reality tree with the given data.                                       |
| updateNodeChildren      | treeId: string \| number, nodeId: string, childrenIds: string[]            | Promise<void>                           | Updates the children of a node in the current reality tree.                                   |
| reviewConfiguration     | wsClientId: string, crt: LtpCurrentRealityTreeData                         | Promise<string>                         | Submits a review configuration for the current reality tree.                                  |
| createDirectCauses      | treeId: string \| number, parentNodeId: string                             | Promise<LtpCurrentRealityTreeDataNode[]>| Creates direct causes for a given parent node ID in the current reality tree.                 |
| addDirectCauses         | treeId: string \| number, parentNodeId: string, causes: string[], type: CrtNodeType | Promise<LtpCurrentRealityTreeDataNode[]>| Adds direct causes to a given parent node in the current reality tree.                       |
| sendGetRefinedCauseQuery| crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[] | Promise<LtpChatBotCrtMessage> | Sends a query to get refined causes based on a chat log and other parameters.                |
| runValidationChain      | crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect: string, causes: string[] | Promise<LtpChatBotCrtMessage> | Runs a validation chain for the current reality tree based on a chat log and other parameters.|
| updateNode              | treeId: string \| number, updatedNode: LtpCurrentRealityTreeDataNode       | Promise<void>                           | Updates a node in the current reality tree with the provided node data.                       |
| deleteNode              | treeId: string \| number, nodeId: string                                   | Promise<void>                           | Deletes a node from the current reality tree.                                                 |

## Examples

```typescript
// Example usage of creating a new current reality tree
const ltpApi = new LtpServerApi();
const crtData = {
  // ... LtpCurrentRealityTreeData properties
};
ltpApi.createTree(crtData).then(crt => {
  console.log('Created CRT:', crt);
});

// Example usage of updating node children
ltpApi.updateNodeChildren('treeId', 'nodeId', ['child1', 'child2']).then(() => {
  console.log('Node children updated successfully');
});
```