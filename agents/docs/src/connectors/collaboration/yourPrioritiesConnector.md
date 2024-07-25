# PsYourPrioritiesConnector

The `PsYourPrioritiesConnector` class is a connector for integrating with the "Your Priorities" platform. It extends the `PsBaseIdeasCollaborationConnector` and provides methods for logging in, voting on posts, creating posts, and generating images using AI.

## Properties

| Name                  | Type                        | Description                                                                 |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------|
| YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID | `string` | The base ID for the Your Priorities connector class.                        |
| YOUR_PRIORITIES_CONNECTOR_VERSION       | `number` | The version number for the Your Priorities connector class.                 |
| getConnectorClass     | `object`                    | Static property containing the configuration for the connector class.       |
| userEmail             | `string`                    | The email of the user for authentication.                                   |
| password              | `string`                    | The password of the user for authentication.                                |
| serverBaseUrl         | `string`                    | The base URL of the Your Priorities server.                                 |
| sessionCookie         | `string` \| `undefined`     | The session cookie for maintaining the session.                             |
| user                  | `YpUserData` \| `undefined` | The user data after successful login.                                       |

## Methods

| Name                          | Parameters                                                                 | Return Type          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData \| undefined = undefined, startProgress: number = 0, endProgress: number = 100` | `void`               | Initializes the connector with the provided configuration and agent data.   |
| login                         | `()`                                                                       | `Promise<void>`      | Logs in to the Your Priorities platform and sets the session cookie.        |
| vote                          | `postId: number, value: number`                                            | `Promise<void>`      | Votes on a post with the given value.                                       |
| post                          | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string` | `Promise<YpPostData>` | Creates a new post in the specified group with the provided data.           |
| generateImageWithAi           | `groupId: number, prompt: string`                                          | `Promise<number>`    | Generates an image using AI based on the provided prompt.                   |
| getExtraConfigurationQuestions | `()`                                                                       | `YpStructuredQuestionData[]` | Returns additional configuration questions for the connector.               |

## Example

```typescript
import { PsYourPrioritiesConnector } from '@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js';

const connector = new PsYourPrioritiesConnector(connectorAttributes, connectorClassAttributes, agent, memory);

async function exampleUsage() {
  await connector.login();
  await connector.vote(123, 1);
  const postData = await connector.post(456, "New Post", structuredAnswersData, "AI Image Prompt");
  console.log(postData);
}

exampleUsage();
```

This example demonstrates how to create an instance of the `PsYourPrioritiesConnector`, log in to the Your Priorities platform, vote on a post, and create a new post with AI-generated images.