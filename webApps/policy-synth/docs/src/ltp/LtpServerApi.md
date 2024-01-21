# LtpServerApi

The `LtpServerApi` class extends the `YpServerApi` class and provides methods for interacting with the LTP (Logical Thinking Process) server API. It includes functionality to manage Current Reality Trees (CRT) and their nodes, as well as to handle chat interactions for refining causes within the CRT.

## Properties

| Name         | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| baseLtpPath  | string | The base path for LTP-related API endpoints.     |
| baseUrlPath  | string | The base URL path for the API.                   |

## Methods

| Name                    | Parameters                                      | Return Type                             | Description                                                                                   |
|-------------------------|-------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| getCrt                  | groupId: number                                 | Promise<LtpCurrentRealityTreeData>      | Retrieves the current reality tree for a given group ID.                                      |
| createTree              | crt: LtpCurrentRealityTreeData                  | Promise<LtpCurrentRealityTreeData>      | Creates a new current reality tree with the provided data.                                    |
| updateNodeChildren      | treeId: string \| number, nodeId: string, childrenIds: string[] | Promise<void> | Updates the children of a specific node in a tree.                                            |
| reviewConfiguration     | wsClientId: string, crt: LtpCurrentRealityTreeData | Promise<string>                    | Reviews the configuration of a current reality tree.                                          |
| createDirectCauses      | treeId: string \| number, parentNodeId: string  | Promise<LtpCurrentRealityTreeDataNode[]> | Creates direct causes for a given parent node ID in a tree.                                   |
| addDirectCauses         | treeId: string \| number, parentNodeId: string, causes: string[], type: CrtNodeType | Promise<LtpCurrentRealityTreeDataNode[]> | Adds direct causes to a parent node in a tree with the specified type.                        |
| sendGetRefinedCauseQuery| crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[] | Promise<LtpChatBotCrtMessage> | Sends a query to get refined causes based on a chat log and other parameters.                 |
| runValidationChain      | crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect: string, causes: string[] | Promise<LtpChatBotCrtMessage> | Runs a validation chain for a given node in a tree based on a chat log and specified causes.  |
| updateNode              | treeId: string \| number, updatedNode: LtpCurrentRealityTreeDataNode | Promise<void> | Updates a node in a tree with the provided node data.                                         |
| deleteNode              | treeId: string \| number, nodeId: string        | Promise<void>                          | Deletes a node from a tree.                                                                   |

## Examples

```typescript
// Example usage of creating a new current reality tree
const ltpApi = new LtpServerApi('/api');
const crtData = {
  // ... LtpCurrentRealityTreeData properties
};
ltpApi.createTree(crtData).then(response => {
  console.log('CRT created:', response);
});

// Example usage of updating node children
ltpApi.updateNodeChildren('treeId', 'nodeId', ['childId1', 'childId2']).then(() => {
  console.log('Node children updated successfully');
});

// Example usage of deleting a node from a tree
ltpApi.deleteNode('treeId', 'nodeId').then(() => {
  console.log('Node deleted successfully');
});
```

Note: The types `LtpCurrentRealityTreeData`, `LtpCurrentRealityTreeDataNode`, `CrtNodeType`, `PsAiChatWsMessage`, and `LtpChatBotCrtMessage` are assumed to be defined elsewhere in the codebase and are required for the proper functioning of the `LtpServerApi` methods.