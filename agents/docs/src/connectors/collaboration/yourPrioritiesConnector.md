# PsYourPrioritiesConnector

The `PsYourPrioritiesConnector` class is a connector for the "Your Priorities" platform. It extends the `PsBaseCollaborationConnector` and provides methods to interact with the "Your Priorities" API, including logging in, voting on posts, creating posts, and generating images using AI.

## Properties

| Name                          | Type                        | Description                                                                 |
|-------------------------------|-----------------------------|-----------------------------------------------------------------------------|
| YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID | `string`                    | The base ID for the Your Priorities connector class.                        |
| YOUR_PRIORITIES_CONNECTOR_VERSION      | `number`                    | The version number for the Your Priorities connector class.                 |
| getConnectorClass             | `PsAgentConnectorClassAttributes` | Static property to get the connector class attributes.                      |
| userEmail                     | `string`                    | The email of the user for authentication.                                   |
| password                      | `string`                    | The password of the user for authentication.                                |
| serverBaseUrl                 | `string`                    | The base URL of the Your Priorities server.                                 |
| sessionCookie                 | `string` \| `undefined`     | The session cookie for authenticated requests.                              |
| user                          | `YpUserData` \| `undefined` | The user data after successful login.                                       |

## Methods

| Name                          | Parameters                                                                 | Return Type          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData \| undefined = undefined, startProgress: number = 0, endProgress: number = 100` | `void`               | Initializes the connector with the provided attributes and configuration.   |
| login                         | `void`                                                                     | `Promise<void>`      | Logs in to the Your Priorities platform and sets the session cookie.        |
| vote                          | `postId: number, value: number`                                            | `Promise<void>`      | Votes on a post with the specified value.                                   |
| post                          | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string` | `Promise<YpPostData>` | Creates a new post in the specified group with the provided data.           |
| generateImageWithAi           | `groupId: number, prompt: string`                                          | `Promise<number>`    | Generates an image using AI with the specified prompt and returns the image ID. |
| getExtraConfigurationQuestions | `void`                                                                     | `YpStructuredQuestionData[]` | Static method to get extra configuration questions for the connector.       |

## Example

```typescript
import { PsYourPrioritiesConnector } from '@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js';

const connectorAttributes = {
  // ...connector attributes
};

const connectorClassAttributes = {
  // ...connector class attributes
};

const agent = {
  // ...agent attributes
};

const memory = {
  // ...memory data
};

const yourPrioritiesConnector = new PsYourPrioritiesConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory
);

yourPrioritiesConnector.login().then(() => {
  console.log("Logged in successfully");
}).catch((error) => {
  console.error("Login failed:", error);
});

yourPrioritiesConnector.vote(123, 1).then(() => {
  console.log("Voted successfully");
}).catch((error) => {
  console.error("Voting failed:", error);
});

yourPrioritiesConnector.post(1, "New Post", [], "AI Image Prompt").then((postData) => {
  console.log("Post created successfully:", postData);
}).catch((error) => {
  console.error("Post creation failed:", error);
});
```

This documentation provides a detailed overview of the `PsYourPrioritiesConnector` class, including its properties, methods, and an example of how to use it.