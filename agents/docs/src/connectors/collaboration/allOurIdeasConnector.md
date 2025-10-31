# PsAllOurIdeasConnector

Connector class for integrating with the "All Our Ideas" voting collaboration platform. This connector enables agents to authenticate, vote on posts, and (in the future) post items to an All Our Ideas server.

**File:** `@policysynth/agents/connectors/collaboration/allOurIdeasConnector.js`

## Properties

| Name           | Type                                 | Description                                                                                 |
|----------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| userEmail      | `string`                             | The email address used to authenticate with the All Our Ideas server.                       |
| password       | `string`                             | The password used to authenticate with the All Our Ideas server.                            |
| serverBaseUrl  | `string`                             | The base URL of the All Our Ideas server.                                                   |
| sessionCookie  | `string \| undefined`                | The session cookie received after successful login, used for authenticated requests.        |
| user           | `YpUserData \| undefined`            | The user data object returned from the All Our Ideas server after login.                    |

## Static Properties

| Name                                         | Type      | Description                                                                                 |
|---------------------------------------------- |-----------|---------------------------------------------------------------------------------------------|
| ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID         | `string`  | Unique identifier for the connector class.                                                  |
| ALL_OUR_IDEAS_CONNECTOR_VERSION               | `number`  | Version number of the connector class.                                                      |
| getConnectorClass                            | `PsAgentConnectorClassCreationAttributes` | Connector class definition, including configuration and setup questions.                    |

## Constructor

```typescript
constructor(
  connector: PsAgentConnectorAttributes,
  connectorClass: PsAgentConnectorClassAttributes,
  agent: PsAgent,
  memory: PsAgentMemoryData | undefined = undefined,
  startProgress: number = 0,
  endProgress: number = 100
)
```

- **Description:** Initializes the connector with configuration, agent, and memory. Throws an error if required configuration values are missing.

## Methods

| Name         | Parameters                                                                 | Return Type         | Description                                                                                 |
|--------------|----------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| login        | none                                                                       | `Promise<void>`     | Authenticates with the All Our Ideas server and stores the session cookie and user data.    |
| vote         | `postId: number, value: number`                                            | `Promise<void>`     | Casts a vote (endorsement) on a post in All Our Ideas.                                      |
| postItems    | `groupId: number, items: []`                                               | `Promise<boolean>`  | (Stub) Intended to post items to a group. Currently returns `false`.                        |

---

### Method Details

#### `login()`

Authenticates the connector with the All Our Ideas server using the configured email and password. On success, stores the user data and session cookie for subsequent requests.

#### `vote(postId: number, value: number)`

Casts a vote (endorsement) on a specific post by sending a POST request to the All Our Ideas server. Requires a valid session cookie (login must be called first).

#### `postItems(groupId: number, items: [])`

Stub for posting items to a group in All Our Ideas. Currently not implemented and always returns `false`.

---

## Example

```typescript
import { PsAllOurIdeasConnector } from '@policysynth/agents/connectors/collaboration/allOurIdeasConnector.js';

// Example instantiation (assuming you have the required objects)
const connector = new PsAllOurIdeasConnector(
  connectorAttributes,      // PsAgentConnectorAttributes
  connectorClassAttributes, // PsAgentConnectorClassAttributes
  agent,                    // PsAgent
  memory                    // PsAgentMemoryData | undefined
);

// Login to All Our Ideas
await connector.login();

// Vote on a post
await connector.vote(12345, 1); // 1 for upvote, -1 for downvote

// (Stub) Post items to a group
const success = await connector.postItems(67890, []);
```

---

## Connector Class Configuration

The static `getConnectorClass` property defines the connector's metadata and setup questions:

- **name:** "All Our Ideas"
- **classType:** VotingCollaboration
- **description:** "Connector for All Our Ideas"
- **hasPublicAccess:** true
- **imageUrl:** URL to the connector's icon
- **iconName:** "allOurIdeas"
- **questions:** Setup questions required for configuration:
  - Name (required)
  - Description
  - All Our Ideas Group Id (required, number)
  - Server Base URL (required)
  - User Email (required)
  - Password (required, password field)

---

## Inheritance

This class extends `PsBaseVotingCollaborationConnector`, inheriting its base voting collaboration logic and structure.

---

## Notes

- The connector requires valid credentials and server URL to function.
- The `postItems` method is a stub and not yet implemented.
- All requests are made using `axios` and require a valid session cookie after login.
