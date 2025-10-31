# PsBaseDiscordConnector

A base class for building Discord notification and chat connectors for PolicySynth agents. This connector enables integration with Discord channels, handling message listening, responding, and archiving conversations. It is designed to be extended for specific Discord bot implementations.

**File:** `@policysynth/agents/connectors/notifications/discordConnector.js`

---

## Properties

| Name                | Type                                                                 | Description                                                                                 |
|---------------------|----------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| client              | `Client`                                                             | The Discord.js client instance used to interact with the Discord API.                       |
| token               | `string`                                                             | The Discord bot token used for authentication.                                              |
| channelName         | `string`                                                             | The name of the Discord channel to connect to.                                              |
| systemPrompt        | `string`                                                             | The system prompt used as the initial message in conversations.                             |
| actions             | `{ [key: string]: () => Promise<void> }`                             | A map of action names to async functions triggered by keywords in responses.                |
| channelTimeouts     | `{ [id: string]: NodeJS.Timeout }`                                   | Stores timeouts for each channel to handle inactivity and archiving.                        |
| maxMessages         | `number`                                                             | Maximum number of messages to keep in memory per conversation (default: 10).                |
| listenDuration      | `number`                                                             | Duration (ms) to listen to a channel before archiving due to inactivity (default: 1 hour).  |

---

## Static Properties

| Name                                 | Type                                         | Description                                                                                 |
|-------------------------------------- |----------------------------------------------|---------------------------------------------------------------------------------------------|
| DISCORD_CONNECTOR_CLASS_BASE_ID       | `string`                                     | Unique class base ID for the Discord connector class.                                       |
| DISCORD_CONNECTOR_VERSION             | `number`                                     | Version number of the connector class.                                                      |
| getConnectorClass                    | `PsAgentConnectorClassCreationAttributes`    | Connector class definition for registration and configuration.                              |

---

## Constructor

```typescript
constructor(
  connector: PsAgentConnectorAttributes,
  connectorClass: PsAgentConnectorClassAttributes,
  agent: PsAgent,
  memory: PsAgentMemoryData | undefined = undefined,
  systemPrompt: string,
  actions: { [key: string]: () => Promise<void> },
  startProgress: number = 0,
  endProgress: number = 100
)
```

- **connector**: The connector instance attributes.
- **connectorClass**: The connector class attributes.
- **agent**: The agent instance.
- **memory**: The agent's memory (optional).
- **systemPrompt**: The system prompt for the conversation.
- **actions**: A map of action names to async functions.
- **startProgress**: Progress value at start (default: 0).
- **endProgress**: Progress value at end (default: 100).

---

## Methods

| Name                       | Parameters                                                                                       | Return Type                                      | Description                                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------|
| login                      | none                                                                                             | `Promise<void>`                                  | Logs the Discord bot in, sets up event listeners for messages, and handles authentication.        |
| replaceInResponseArray     | `response: string`                                                                               | `Promise<{ modifiedResponse: string; actionsTriggered: string[] }>` | Replaces action keywords in a response and triggers corresponding actions.                        |
| respondToUser              | `channelId: string, conversation: DiscordConversation`                                           | `Promise<void>`                                  | Responds to a user in a channel based on the conversation history and system prompt.              |
| sendMessage                | `channelId: string, message: string`                                                             | `Promise<void>`                                  | Sends a message to a specified Discord channel.                                                   |
| handleMessage              | `message: Message`                                                                               | `Promise<void>`                                  | Handles an incoming Discord message, updates conversation memory, and triggers a response.         |
| setChannelTimeout          | `channelId: string`                                                                              | `void`                                           | Sets a timeout for a channel to archive the conversation after inactivity.                        |
| archiveConversation        | `channelId: string`                                                                              | `void`                                           | Archives the conversation for a channel and removes it from the live conversations.               |
| getMessages                | `channelId: string`                                                                              | `Promise<string[]>`                              | Fetches the last 100 messages from a Discord channel.                                             |
| sendNotification           | `channelId: string, message: string`                                                             | `Promise<void>`                                  | Sends a notification message to a Discord channel.                                                |
| static getExtraConfigurationQuestions | none                                                                                   | `YpStructuredQuestionData[]`                     | Returns extra configuration questions required for the Discord connector.                         |

---

## Example

```typescript
import { PsBaseDiscordConnector } from '@policysynth/agents/connectors/notifications/discordConnector.js';

// Example instantiation
const connector = new PsBaseDiscordConnector(
  connectorAttributes,         // PsAgentConnectorAttributes
  connectorClassAttributes,    // PsAgentConnectorClassAttributes
  agentInstance,               // PsAgent
  agentMemory,                 // PsAgentMemoryData | undefined
  "You are a helpful Discord bot.", // systemPrompt
  {
    "!help": async () => { /* ... */ },
    "!info": async () => { /* ... */ }
  }
);

// Start the bot
await connector.login();
```

---

## Configuration Questions Example

The connector class requires the following configuration questions (see `getExtraConfigurationQuestions`):

- **discordBotToken**: Bot Token (required)
- **competitorChannelName**: Competitor Channel Name (required)
- **customerChannelName**: Customer Channel Name (required)
- **productIdeasChannelName**: Product Ideas Channel Name (required)
- **useCaseChannelName**: Use Case Channel Name (required)

---

## Notes

- This class is intended to be extended for custom Discord bot implementations.
- It manages live and archived conversations in memory for each channel.
- It supports action triggers based on keywords in model responses.
- Integrates with PolicySynth agent memory and model-calling infrastructure.

---