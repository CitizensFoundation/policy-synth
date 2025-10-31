# PsYourPrioritiesConnector

A connector class for integrating with the Your Priorities platform, enabling ideas collaboration, posting, voting, and AI image generation. This connector is designed to be used as part of the PolicySynth agent framework and extends the `PsBaseIdeasCollaborationConnector`.

**File:** `@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js`

## Properties

| Name                | Type                                         | Description                                                                                   |
|---------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| userEmail           | `string`                                     | The email address used for authentication with Your Priorities.                               |
| password            | `string`                                     | The password used for authentication with Your Priorities.                                    |
| serverBaseUrl       | `string`                                     | The base URL of the Your Priorities server.                                                   |
| sessionCookie       | `string \| undefined`                        | The session cookie received after login, used for authenticated requests.                     |
| user                | `YpUserData \| undefined`                    | The user data object returned after successful login.                                         |
| agentFabricUserId   | `number \| undefined`                        | The user ID for Agent Fabric integration, if applicable.                                      |

## Static Properties

| Name                                   | Type                                         | Description                                                                                   |
|-----------------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID | `string`                                     | The unique class base ID for this connector.                                                  |
| YOUR_PRIORITIES_CONNECTOR_VERSION       | `number`                                     | The version number of this connector class.                                                   |
| baseQuestions                          | `YpStructuredQuestionData[]`                 | The base configuration questions required for the connector.                                  |
| loginQuestions                         | `YpStructuredQuestionData[]`                 | The login configuration questions required if API key is not used.                            |
| getConnectorClass                      | `PsAgentConnectorClassCreationAttributes`    | The static definition of the connector class for registration.                                |

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

- Initializes the connector with configuration, credentials, and logging.
- Throws errors if required configuration is missing.

## Methods

| Name                    | Parameters                                                                                                   | Return Type                | Description                                                                                                 |
|-------------------------|--------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| requestWithRetry        | `requestFn: () => Promise<T>`                                                                                | `Promise<T>`               | Helper to retry requests on connection or server errors, with exponential backoff.                          |
| login                   | none                                                                                                         | `Promise<void>`            | Authenticates with Your Priorities and stores session cookie.                                               |
| getHeaders              | none                                                                                                         | `object`                   | Returns appropriate headers for requests (API key or session cookie).                                       |
| getGroupPosts           | `groupId: number`                                                                                            | `Promise<YpPostData[]>`    | Fetches all posts for a given group, paginated, with retries.                                               |
| postPoint               | `groupId: number, postId: number, userId: number, value: number, content: string`                            | `Promise<YpPointData>`     | Posts a point (argument) to a specific post in a group.                                                     |
| vote                    | `postId: number, value: number`                                                                              | `Promise<void>`            | Casts a vote (endorsement) on a post.                                                                       |
| post                    | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string, imageLocalPath?: string` | `Promise<YpPostData>`      | Creates a new post in a group, optionally uploading or generating an image.                                 |
| generateImageWithAi     | `groupId: number, prompt: string`                                                                            | `Promise<number>`          | Generates an AI image for a group using a prompt, with polling and timeout.                                 |
| getExtraConfigurationQuestions | none                                                                                                  | `YpStructuredQuestionData[]` | Returns extra configuration questions required for the connector, depending on environment variables.        |

## Example

```typescript
import { PsYourPrioritiesConnector } from '@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js';

// Example instantiation (assuming you have the required objects)
const connector = new PsYourPrioritiesConnector(
  connectorAttributes,
  connectorClassAttributes,
  agentInstance,
  undefined, // memory
  0,         // startProgress
  100        // endProgress
);

// Fetch posts from a group
const posts = await connector.getGroupPosts(12345);

// Post a new idea with AI-generated image
const newPost = await connector.post(
  12345,
  "My New Idea",
  [{ uniqueId: "description", value: "This is my idea." }],
  "A futuristic city skyline at sunset"
);

// Vote on a post
await connector.vote(newPost.id, 1);

// Add a point (argument) to a post
const point = await connector.postPoint(12345, newPost.id, connector.user?.id ?? 0, 1, "This is a supporting argument.");
```

## Details

- **Retries:** All network requests are retried for connection and server errors, with configurable limits and delays.
- **Authentication:** Supports both API key and username/password authentication, depending on environment variables.
- **Image Handling:** Can upload a local image or generate one using the Your Priorities AI image endpoint, with polling and timeout.
- **Configuration:** The connector class exposes static methods and properties for integration with agent registries and UI configuration.

---

**Note:** This connector is intended for use within the PolicySynth agent framework and expects certain environment variables and agent infrastructure to be present.