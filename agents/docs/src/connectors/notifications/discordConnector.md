# PsBaseDiscordAgent

The `PsBaseDiscordAgent` class is a connector for integrating a Discord bot with the PolicySynth platform. It extends the `PsBaseNotificationsConnector` class and provides functionalities for handling Discord messages, sending notifications, and managing conversations.

## Properties

| Name                | Type                                      | Description                                                                 |
|---------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| DISCORD_CONNECTOR_CLASS_BASE_ID | `string`                                  | Static constant for the Discord connector class base ID.                    |
| DISCORD_CONNECTOR_VERSION       | `number`                                  | Static constant for the Discord connector version.                          |
| getConnectorClass               | `PsConnectorClassCreationAttributes`      | Static property for the connector class attributes.                         |
| client                          | `Client`                                  | Instance of the Discord client.                                             |
| token                           | `string`                                  | Discord bot token.                                                          |
| channelName                     | `string`                                  | Name of the Discord channel to connect to.                                  |
| systemPrompt                    | `string`                                  | System prompt for the bot.                                                  |
| actions                         | `{ [key: string]: () => Promise<void> }`  | Actions that the bot can perform.                                           |
| channelTimeouts                 | `{ [id: string]: NodeJS.Timeout }`        | Timeouts for channels to stop listening after inactivity.                   |
| maxMessages                     | `number`                                  | Maximum number of messages to keep in memory for a conversation.            |
| listenDuration                  | `number`                                  | Duration to listen to a channel before stopping due to inactivity (in ms).  |

## Methods

| Name                        | Parameters                                                                 | Return Type         | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| constructor                 | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData | undefined, systemPrompt: string, actions: { [key: string]: () => Promise<void> }, startProgress: number, endProgress: number` | `void`              | Constructor for initializing the Discord agent.                              |
| login                       | `()`                                                                       | `Promise<void>`     | Logs in the Discord bot.                                                    |
| replaceInResponseArray      | `response: string`                                                         | `Promise<{ modifiedResponse: string; actionsTriggered: string[] }>` | Replaces actions in the response array and triggers them.                   |
| respondToUser               | `channelId: string, conversation: DiscordConversation`                     | `Promise<void>`     | Responds to a user in a Discord channel.                                    |
| sendMessage                 | `channelId: string, message: string`                                       | `Promise<void>`     | Sends a message to a Discord channel.                                       |
| handleMessage               | `message: Message`                                                         | `Promise<void>`     | Handles incoming messages from Discord.                                     |
| setChannelTimeout           | `channelId: string`                                                        | `void`              | Sets a timeout for a channel to stop listening after inactivity.            |
| archiveConversation         | `channelId: string`                                                        | `void`              | Archives a conversation after inactivity.                                   |
| getMessages                 | `channelId: string`                                                        | `Promise<string[]>` | Fetches messages from a Discord channel.                                    |
| sendNotification            | `channelId: string, message: string`                                       | `Promise<void>`     | Sends a notification to a Discord channel.                                  |
| getExtraConfigurationQuestions | `()`                                                                       | `YpStructuredQuestionData[]` | Static method to get extra configuration questions for the connector.       |

## Example

```typescript
import { PsBaseDiscordAgent } from '@policysynth/agents/connectors/notifications/discordConnector.js';

const connector = /* PsAgentConnectorAttributes */;
const connectorClass = /* PsAgentConnectorClassAttributes */;
const agent = /* PsAgent */;
const memory = /* PsAgentMemoryData | undefined */;
const systemPrompt = "Hello! How can I assist you today?";
const actions = {
  greet: async () => {
    console.log("Greeting action triggered!");
  },
};

const discordAgent = new PsBaseDiscordAgent(
  connector,
  connectorClass,
  agent,
  memory,
  systemPrompt,
  actions
);

discordAgent.login().then(() => {
  console.log("Discord bot is running!");
});
```

This example demonstrates how to initialize and run the `PsBaseDiscordAgent` with a custom system prompt and actions. The bot logs in and starts listening for messages in the specified Discord channel.