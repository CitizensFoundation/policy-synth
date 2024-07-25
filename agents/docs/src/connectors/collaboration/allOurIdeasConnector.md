# PsAllOurIdeasConnector

The `PsAllOurIdeasConnector` class is a connector for the "All Our Ideas" platform, extending the `PsBaseVotingCollaborationConnector`. It provides methods for logging in and voting on posts within the "All Our Ideas" platform.

## Properties

| Name                          | Type                                | Description                                                                 |
|-------------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID | `string`                            | Static constant for the connector class base ID.                            |
| ALL_OUR_IDEAS_CONNECTOR_VERSION       | `number`                            | Static constant for the connector version.                                  |
| getConnectorClass                    | `object`                            | Static object containing the connector class configuration.                 |
| userEmail                            | `string`                            | The email of the user for authentication.                                   |
| password                             | `string`                            | The password of the user for authentication.                                |
| serverBaseUrl                        | `string`                            | The base URL of the "All Our Ideas" server.                                 |
| sessionCookie                        | `string` (optional)                 | The session cookie received after login.                                    |
| user                                 | `YpUserData` (optional)             | The user data received after login.                                         |

## Methods

| Name           | Parameters                                                                 | Return Type | Description                                                                 |
|----------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor    | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData | undefined = undefined, startProgress: number = 0, endProgress: number = 100` | `void`      | Initializes the connector with the provided configuration and agent data. |
| login          | `none`                                                                     | `Promise<void>` | Logs in to the "All Our Ideas" platform and sets the session cookie.        |
| vote           | `postId: number, value: number`                                            | `Promise<void>` | Votes on a post with the given ID and value.                                |
| postItems      | `groupId: number, items: []`                                               | `Promise<boolean>` | Placeholder method for posting items to a group.                            |

## Example

```typescript
import { PsAllOurIdeasConnector } from '@policysynth/agents/connectors/collaboration/allOurIdeasConnector.js';

const connectorAttributes = {
  // ...connector attributes
};

const connectorClassAttributes = {
  // ...connector class attributes
};

const agent = {
  // ...agent data
};

const memory = {
  // ...memory data
};

const allOurIdeasConnector = new PsAllOurIdeasConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory
);

allOurIdeasConnector.login().then(() => {
  allOurIdeasConnector.vote(123, 1).then(() => {
    console.log("Voted successfully!");
  }).catch((error) => {
    console.error("Voting failed:", error);
  });
}).catch((error) => {
  console.error("Login failed:", error);
});
```

This example demonstrates how to initialize the `PsAllOurIdeasConnector`, log in to the "All Our Ideas" platform, and vote on a post.