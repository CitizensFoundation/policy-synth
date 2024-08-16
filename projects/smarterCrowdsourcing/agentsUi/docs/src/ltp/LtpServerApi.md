# LtpServerApi

This class extends the `YpServerApi` to provide methods for interacting with the LTP (Logical Thinking Process) server API. It includes functionalities such as creating, updating, and fetching Current Reality Trees (CRTs), managing nodes and their children, and handling chat interactions for refining causes and running validation chains.

## Properties

| Name         | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| baseLtpPath  | string | The base path for LTP related API endpoints.     |
| baseUrlPath  | string | The base URL path for the API, default is '/api'.|

## Methods

| Name                    | Parameters                                                                                   | Return Type                                  | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| getCrt                  | groupId: number                                                                              | Promise<LtpCurrentRealityTreeData>          | Fetches the current reality tree for a given group ID.                                        |
| createTree              | crt: LtpCurrentRealityTreeData                                                               | Promise<LtpCurrentRealityTreeData>          | Creates a new current reality tree with the given data.                                       |
| updateNodeChildren      | treeId: string \| number, nodeId: string, childrenIds: string[]                              | Promise<void>                               | Updates the children of a node in a tree.                                                     |
| reviewConfiguration     | wsClientId: string, crt: LtpCurrentRealityTreeData                                           | Promise<string>                             | Reviews the configuration of a CRT.                                                            |
| createDirectCauses      | treeId: string \| number, parentNodeId: string                                               | Promise<LtpCurrentRealityTreeDataNode[]>    | Creates direct causes for a parent node in a tree.                                            |
| addDirectCauses         | treeId: string \| number, parentNodeId: string, causes: string[], type: CrtNodeType          | Promise<LtpCurrentRealityTreeDataNode[]>    | Adds direct causes to a parent node in a tree.                                                |
| sendGetRefinedCauseQuery| crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[] | Promise<LtpChatBotCrtMessage> | Sends a query to get refined causes based on a chat log.                                      |
| runValidationChain      | crtTreeId: string \| number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect: string, causes: string[] | Promise<LtpChatBotCrtMessage> | Runs a validation chain for a given node based on a chat log.                                 |
| updateNode              | treeId: string \| number, updatedNode: LtpCurrentRealityTreeDataNode                         | Promise<void>                               | Updates a node in a tree.                                                                      |
| deleteNode              | treeId: string \| number, nodeId: string                                                     | Promise<void>                               | Deletes a node from a tree.                                                                    |

## Example

```typescript
import { LtpServerApi } from '@policysynth/webapp/ltp/LtpServerApi.js';

const ltpServerApi = new LtpServerApi('/api');

// Example usage of getCrt method
const groupId = 1;
ltpServerApi.getCrt(groupId).then(crtData => {
  console.log(crtData);
});

// Example usage of createTree method
const crtData = {/* LtpCurrentRealityTreeData object */};
ltpServerApi.createTree(crtData).then(newCrtData => {
  console.log(newCrtData);
});
```

Note: Replace `/* LtpCurrentRealityTreeData object */` with an actual `LtpCurrentRealityTreeData` object according to your needs.