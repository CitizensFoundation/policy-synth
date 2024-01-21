# LtpServerApi

The `LtpServerApi` class extends the `YpServerApi` class to provide methods for interacting with the LTP (Logical Thinking Process) Current Reality Tree (CRT) API. It includes methods for creating, updating, and deleting nodes within a CRT, as well as for running validation chains and refining causes.

## Properties

| Name         | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| baseLtpPath  | string | The base path for LTP-related API endpoints.     |
| baseUrlPath  | string | The base URL path for API endpoints.             |

## Methods

| Name                    | Parameters                                                                 | Return Type                             | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| getCrt                  | groupId: number                                                            | Promise<LtpCurrentRealityTreeData>      | Fetches the current reality tree for a given group ID.                                        |
| createTree              | crt: LtpCurrentRealityTreeData                                             | Promise<LtpCurrentRealityTreeData>      | Creates a new current reality tree with the provided data.                                    |
| updateNodeChildren      | treeId: string \| number, nodeId: string, childrenIds: string[]            | Promise<void>                           | Updates the children of a node in the current reality tree.                                   |
| reviewConfiguration     | wsClientId: string, crt: LtpCurrentRealityTreeData                         | Promise<string>                         | Reviews the configuration of the current reality tree.                                        |
| createDirectCauses      | treeId: string \| number, parentNodeId: string                             | Promise<LtpCurrentRealityTreeDataNode[]>| Creates direct causes for a given parent node ID in the current reality tree.                 |
| addDirectCauses         | treeId: string \| number, parentNodeId: string, causes: string[], type: CrtNodeType | Promise<LtpCurrentRealityTreeDataNode[]>| Adds direct causes to a node in the current reality tree.                                     |
| sendGetRefinedCauseQuery| crtTreeId: string \| number, crtNodeId: string, chatLog: LtpAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[] | Promise<LtpChatBotCrtMessage> | Sends a query to get refined causes based on a chat log and other parameters.                |
| runValidationChain      | crtTreeId: string \| number, crtNodeId: string, chatLog: LtpAiChatWsMessage[], wsClientId: string, effect: string, causes: string[] | Promise<LtpChatBotCrtMessage> | Runs a validation chain for a node in the current reality tree based on a chat log and other parameters. |
| updateNode              | treeId: string \| number, updatedNode: LtpCurrentRealityTreeDataNode       | Promise<void>                           | Updates a node in the current reality tree with the provided data.                            |
| deleteNode              | treeId: string \| number, nodeId: string                                   | Promise<void>                           | Deletes a node from the current reality tree.                                                |

## Examples

```typescript
// Example usage of LtpServerApi to fetch a current reality tree
const ltpApi = new LtpServerApi();
const groupId = 123;
ltpApi.getCrt(groupId).then(crtData => {
  console.log(crtData);
});

// Example usage of LtpServerApi to create a new current reality tree
const newCrtData = { /* ... */ };
ltpApi.createTree(newCrtData).then(createdCrt => {
  console.log(createdCrt);
});

// Example usage of LtpServerApi to update node children
const treeId = 'tree123';
const nodeId = 'node456';
const childrenIds = ['child1', 'child2'];
ltpApi.updateNodeChildren(treeId, nodeId, childrenIds).then(() => {
  console.log('Node children updated successfully');
});
```

Please note that the actual implementation of `LtpCurrentRealityTreeData`, `LtpCurrentRealityTreeDataNode`, `CrtNodeType`, `LtpAiChatWsMessage`, and `LtpChatBotCrtMessage` types are not provided in the example above. These should be defined elsewhere in your codebase.