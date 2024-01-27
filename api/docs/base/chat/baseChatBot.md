# PsBaseChatBot

This class represents a base chatbot for the PolicySynth platform, handling interactions with clients through WebSocket and integrating with OpenAI's GPT models for generating responses.

## Properties

| Name                          | Type                                            | Description                                                                 |
|-------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------|
| clientId                      | string                                          | Unique identifier for the client.                                           |
| clientSocket                  | WebSocket                                       | WebSocket connection for the client.                                        |
| openaiClient                  | OpenAI                                          | Client for interacting with OpenAI's API.                                   |
| memory                        | PsBaseMemoryData                     | Memory data for the engine's innovation process.                            |
| currentAgent                  | PolicySynthAgentBase \| undefined               | The current agent handling the chat, if any.                                |
| broadcastingLiveCosts         | boolean                                         | Flag indicating if live costs are being broadcasted.                        |
| liveCostsBroadcastTimeout     | NodeJS.Timeout \| undefined                     | Timeout for broadcasting live costs.                                        |
| liveCostsBroadcastInterval    | number                                          | Interval in milliseconds for broadcasting live costs.                       |
| liveCostsInactivityTimeout    | number                                          | Timeout in milliseconds for inactivity during live cost broadcasting.       |
| liveCostsBoadcastStartAt      | Date \| undefined                               | Timestamp when live cost broadcasting started.                              |
| lastSentToUserAt              | Date \| undefined                               | Timestamp of the last message sent to the user.                             |

## Methods

| Name                        | Parameters                                                                 | Return Type            | Description                                                                                   |
|-----------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| renderSystemPrompt          |                                                                            | string                 | Generates a system prompt to be replaced with a user-friendly message.                       |
| sendToClient                | sender: string, message: string, type = "stream"                           | void                   | Sends a message to the client through the WebSocket connection.                              |
| sendAgentStart              | name: string, hasNoStreaming = true                                        | void                   | Notifies the client that an agent has started, with an option for streaming.                 |
| sendAgentCompleted          | name: string, lastAgent = false, error: string \| undefined = undefined    | void                   | Sends a completion message for an agent, including any errors.                               |
| sendAgentUpdate             | message: string                                                             | void                   | Sends an update message from the agent to the client.                                        |
| startBroadcastingLiveCosts  |                                                                            | void                   | Starts the process of broadcasting live costs to the client.                                 |
| broadCastLiveCosts          |                                                                            | void                   | Broadcasts live costs to the client, if broadcasting is active.                               |
| stopBroadcastingLiveCosts   |                                                                            | void                   | Stops broadcasting live costs to the client.                                                 |
| getEmptyMemory              |                                                                            | PsBaseMemoryData | Returns a new, empty memory data structure for the engine's innovation process.              |
| streamWebSocketResponses    | stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>                | Promise<void>          | Streams responses from OpenAI's chat completions to the client.                              |
| conversation                | chatLog: PsSimpleChatLog[]                                                 | Promise<void>          | Initiates a conversation with the client, using OpenAI's chat completions for responses.     |

## Examples

```
// Example usage of PsBaseChatBot
import { PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';

const wsClients = new Map<string, WebSocket>();
const clientId = 'unique-client-id';
const chatBot = new PsBaseChatBot(clientId, wsClients);

// Example of sending a message to the client
chatBot.sendToClient('bot', 'Hello, how can I assist you today?');

// Starting a conversation with predefined chat log
const chatLog = [
  { sender: 'user', message: 'What can you do?' },
  { sender: 'bot', message: 'I can provide information, help solve problems, and more.' }
];
chatBot.conversation(chatLog);
```