# PsYourPrioritiesConnector

The `PsYourPrioritiesConnector` class is a connector for the Your Priorities Ideas Collaboration platform. It extends the `PsBaseIdeasCollaborationConnector` and provides methods for logging in, fetching group posts, voting on posts, and posting new content with optional AI-generated images.

## Properties

| Name                  | Type                              | Description                                                                 |
|-----------------------|-----------------------------------|-----------------------------------------------------------------------------|
| YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID | `string`                          | Static constant for the connector class base ID.                            |
| YOUR_PRIORITIES_CONNECTOR_VERSION      | `number`                          | Static constant for the connector version.                                  |
| baseQuestions          | `YpStructuredQuestionData[]`      | Static array of base questions for the connector configuration.             |
| loginQuestions         | `YpStructuredQuestionData[]`      | Static array of login questions for the connector configuration.            |
| getConnectorClass      | `PsAgentConnectorClassCreationAttributes` | Static configuration for the connector class.                               |
| userEmail              | `string`                          | The email of the user for authentication.                                   |
| password               | `string`                          | The password of the user for authentication.                                |
| serverBaseUrl          | `string`                          | The base URL of the Your Priorities server.                                 |
| sessionCookie          | `string` \| `undefined`           | The session cookie for authenticated requests.                              |
| user                   | `YpUserData` \| `undefined`       | The user data after successful login.                                       |
| agentFabricUserId      | `number` \| `undefined`           | The user ID for the agent fabric, if applicable.                            |

## Methods

| Name                          | Parameters                                                                 | Return Type          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData \| undefined = undefined, startProgress: number = 0, endProgress: number = 100` | `void`               | Constructs a new instance of the connector with the given parameters.       |
| login                         | `()`                                                                       | `Promise<void>`      | Logs in to the Your Priorities platform using the provided credentials.     |
| getHeaders                    | `()`                                                                       | `object`             | Returns the headers for authenticated requests.                             |
| getGroupPosts                 | `groupId: number`                                                          | `Promise<YpPostData[]>` | Fetches posts from a specified group.                                       |
| vote                          | `postId: number, value: number`                                            | `Promise<void>`      | Votes on a specified post with the given value.                             |
| post                          | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string, imageLocalPath: string \| undefined = undefined` | `Promise<YpPostData>` | Posts new content to a specified group, optionally with an AI-generated image. |
| generateImageWithAi           | `groupId: number, prompt: string`                                          | `Promise<number>`    | Generates an AI image based on the given prompt and returns the image ID.   |
| getExtraConfigurationQuestions | `()`                                                                       | `YpStructuredQuestionData[]` | Returns additional configuration questions based on environment variables.  |

## Example

```typescript
import { PsYourPrioritiesConnector } from '@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js';

// Example usage of PsYourPrioritiesConnector
const connector = new PsYourPrioritiesConnector(connectorAttributes, connectorClassAttributes, agent, memory);
await connector.login();
const posts = await connector.getGroupPosts(123);
await connector.vote(posts[0].id, 1);
const newPost = await connector.post(123, "New Idea", structuredAnswers, "Generate an image of a futuristic city");
```