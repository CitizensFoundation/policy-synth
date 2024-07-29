# PsBaseDiscordConnector

The `PsBaseDiscordConnector` class is a connector for integrating with Discord, specifically designed for market research bots. It extends the `PsBaseNotificationsConnector` class and provides functionalities to interact with Discord channels, handle messages, and respond to users.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| DISCORD_CONNECTOR_CLASS_BASE_ID | `string`                                  | Static constant representing the base ID for the Discord connector class.   |
| DISCORD_CONNECTOR_VERSION       | `number`                                  | Static constant representing the version of the Discord connector class.    |
| getConnectorClass               | `PsAgentConnectorClassCreationAttributes` | Static property defining the connector class attributes.                    |
| client                          | `Client`                                  | Instance of the Discord client.                                             |
| token                           | `string`                                  | Discord bot token.                                                          |
| channelName                     | `string`                                  | Name of the Discord channel to connect to.                                  |
| systemPrompt                    | `string`                                  | System prompt for the bot.                                                  |
| actions                         | `{ [key: string]: () => Promise<void> }`   | Actions that the bot can perform.                                           |
| channelTimeouts                 | `{ [id: string]: NodeJS.Timeout }`         | Timeouts for channels to stop listening after inactivity.                   |
| maxMessages                     | `number`                                  | Maximum number of messages to keep in memory for a conversation.            |
| listenDuration                  | `number`                                  | Duration to listen to a channel before stopping due to inactivity.          |

## Methods

| Name                          | Parameters                                                                 | Return Type         | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| constructor                   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData \| undefined, systemPrompt: string, actions: { [key: string]: () => Promise<void> }, startProgress: number, endProgress: number` | `void`              | Constructor to initialize the Discord connector.                            |
| login                         | `()`                                                                       | `Promise<void>`     | Logs in the Discord bot using the provided token.                           |
| replaceInResponseArray        | `response: string`                                                         | `Promise<{ modifiedResponse: string; actionsTriggered: string[] }>` | Replaces actions in the response array and triggers them.                   |
| respondToUser                 | `channelId: string, conversation: DiscordConversation`                     | `Promise<void>`     | Responds to a user in a specific channel.                                   |
| sendMessage                   | `channelId: string, message: string`                                       | `Promise<void>`     | Sends a message to a specific channel.                                      |
| handleMessage                 | `message: Message`                                                         | `Promise<void>`     | Handles incoming messages and processes them.                               |
| setChannelTimeout             | `channelId: string`                                                        | `void`              | Sets a timeout for a channel to stop listening after inactivity.            |
| archiveConversation           | `channelId: string`                                                        | `void`              | Archives a conversation after inactivity.                                   |
| getMessages                   | `channelId: string`                                                        | `Promise<string[]>` | Fetches messages from a specific channel.                                   |
| sendNotification              | `channelId: string, message: string`                                       | `Promise<void>`     | Sends a notification to a specific channel.                                 |
| static getExtraConfigurationQuestions | `()`                                                                       | `YpStructuredQuestionData[]` | Returns extra configuration questions for the Discord connector.            |

## Example

```typescript
import { PsBaseDiscordConnector } from '@policysynth/agents/connectors/notifications/discordConnector.js';

const connector = new PsBaseDiscordConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory,
  "System prompt for the bot",
  {
    action1: async () => { /* action implementation */ },
    action2: async () => { /* action implementation */ },
  }
);

connector.login().then(() => {
  console.log("Bot logged in and ready!");
});
```

This example demonstrates how to create an instance of the `PsBaseDiscordConnector` class, configure it with necessary attributes, and log in the bot to start interacting with Discord channels.