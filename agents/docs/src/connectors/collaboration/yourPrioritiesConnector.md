# PsYourPrioritiesConnector

A connector class for integrating with the Your Priorities platform, enabling ideas collaboration, posting, voting, and AI image generation. This connector supports both API key and user/password authentication, and is designed to be used as part of the PolicySynth agent framework.

**File:** `@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js`

## Properties

| Name                | Type                                      | Description                                                                                 |
|---------------------|-------------------------------------------|---------------------------------------------------------------------------------------------|
| userEmail           | `string`                                  | The email address used for authentication (if not using API key).                           |
| password            | `string`                                  | The password used for authentication (if not using API key).                                |
| serverBaseUrl       | `string`                                  | The base URL of the Your Priorities server.                                                 |
| sessionCookie       | `string \| undefined`                     | The session cookie received after login (if using user/password authentication).            |
| user                | `YpUserData \| undefined`                 | The authenticated user data after login.                                                    |
| agentFabricUserId   | `number \| undefined`                     | The user ID for agent fabric integration (if using API key).                                |

## Static Properties

| Name                                    | Type                                               | Description                                                                                 |
|------------------------------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------|
| YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID  | `string`                                           | Unique class base ID for this connector.                                                    |
| YOUR_PRIORITIES_CONNECTOR_VERSION        | `number`                                           | Version number of the connector.                                                            |
| baseQuestions                           | `YpStructuredQuestionData[]`                       | Base configuration questions for the connector.                                             |
| loginQuestions                          | `YpStructuredQuestionData[]`                       | Login configuration questions for the connector.                                            |
| getConnectorClass                       | `PsAgentConnectorClassCreationAttributes`          | Connector class definition for registration.                                                |

## Methods

| Name                          | Parameters                                                                                                                                                                                                 | Return Type                | Description                                                                                                 |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                   | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData, startProgress?: number, endProgress?: number                           | `PsYourPrioritiesConnector`| Initializes the connector with configuration and authentication details.                                     |
| login                         | none                                                                                                                                                                                                       | `Promise<void>`            | Authenticates with the Your Priorities server (unless using API key).                                       |
| getHeaders                    | none                                                                                                                                                                                                       | `object`                   | Returns the appropriate headers for API requests (API key or session cookie).                               |
| getGroupPosts                 | groupId: number                                                                                                                                                                                            | `Promise<YpPostData[]>`    | Fetches all posts for a given group, handling pagination and retries.                                       |
| vote                          | postId: number, value: number                                                                                                                                                                              | `Promise<void>`            | Casts a vote (endorsement) on a post.                                                                       |
| post                          | groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string, imageLocalPath?: string                                            | `Promise<YpPostData>`      | Creates a new post in a group, optionally uploading or generating an image.                                 |
| generateImageWithAi           | groupId: number, prompt: string                                                                                                                                                                            | `Promise<number>`          | Generates an AI image for a group using a prompt, polling until completion or timeout.                      |
| static getExtraConfigurationQuestions | none                                                                                                                                                                                                | `YpStructuredQuestionData[]`| Returns extra configuration questions required for the connector (if not using API key).                     |

## Example

```typescript
import { PsYourPrioritiesConnector } from '@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js';

// Example instantiation (assuming you have the required objects)
const connector = new PsYourPrioritiesConnector(
  connectorAttributes,
  connectorClassAttributes,
  agentInstance,
  agentMemoryData
);

// Fetch posts from a group
const posts = await connector.getGroupPosts(12345);

// Vote on a post
await connector.vote(posts[0].id, 1);

// Post a new idea with AI-generated image
const newPost = await connector.post(
  12345,
  "My New Idea",
  [{ uniqueId: "description", value: "This is my idea." }],
  "A futuristic city skyline"
);
```

## Details

- **Authentication:**  
  - If `PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY` is set, uses API key authentication.
  - Otherwise, uses user email and password to log in and obtain a session cookie.

- **Robustness:**  
  - All HTTP requests are wrapped with a retry mechanism for connection and server errors.
  - Image uploads and AI image generation are retried and fallback to AI generation if local upload fails.

- **Posting:**  
  - Posts can include structured answers and an image (either uploaded or AI-generated).
  - If image upload fails, the connector attempts to generate an AI image.

- **AI Image Generation:**  
  - Uses a polling mechanism with a 2-minute timeout to wait for image generation completion.

- **Configuration:**  
  - The connector exposes configuration questions for integration into agent UIs.

## Related Types

- `YpStructuredQuestionData`
- `YpStructuredAnswer`
- `YpPostData`
- `YpUserData`
- `PsAgentConnectorAttributes`
- `PsAgentConnectorClassAttributes`
- `PsAgent`
- `PsAgentMemoryData`
- `PsAgentConnectorClassCreationAttributes`

---

**Note:**  
This connector is intended for use within the PolicySynth agent framework and expects certain environment variables and agent infrastructure to be present.