# PsBaseChatBot

This class represents a base chatbot that integrates with OpenAI's GPT models and manages chat sessions, including memory persistence, live cost broadcasting, and WebSocket communication.

## Properties

| Name                          | Type                                  | Description                                                                 |
|-------------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| wsClientId                    | string                                | WebSocket client identifier.                                                |
| wsClientSocket                | WebSocket                             | WebSocket client socket.                                                    |
| openaiClient                  | OpenAI                                | OpenAI client for interacting with GPT models.                              |
| memory                        | PsChatBotMemoryData                   | Memory data for the chatbot session.                                        |
| broadcastingLiveCosts         | boolean                               | Flag indicating if live costs are being broadcasted.                        |
| liveCostsBroadcastInterval    | number                                | Interval for broadcasting live costs.                                       |
| liveCostsInactivityTimeout    | number                                | Timeout for inactivity during live cost broadcasting.                       |
| static redisMemoryKeyPrefix   | string                                | Prefix for Redis memory keys.                                               |
| tempeture                     | number                                | Temperature setting for the GPT model.                                      |
| maxTokens                     | number                                | Maximum number of tokens for the GPT model.                                 |
| llmModel                      | string                                | The GPT model being used.                                                   |
| persistMemory                 | boolean                               | Flag indicating if memory should be persisted.                              |
| memoryId                      | string \| undefined                   | Identifier for the chatbot's memory.                                        |
| liveCostsBroadcastTimeout     | NodeJS.Timeout \| undefined           | Timeout handle for live costs broadcasting.                                 |
| liveCostsBoadcastStartAt      | Date \| undefined                     | Start time for live costs broadcasting.                                     |
| lastSentToUserAt              | Date \| undefined                     | Timestamp of the last message sent to the user.                             |
| lastBroacastedCosts           | number \| undefined                   | Last broadcasted live costs.                                                |

## Methods

| Name                          | Parameters                            | Return Type                             | Description                                                                 |
|-------------------------------|---------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------|
| redisKey                      |                                       | string                                  | Gets the Redis key for the chatbot's memory.                                |
| loadMemoryFromRedis           | memoryId: string                      | Promise<PsChatBotMemoryData \| undefined> | Loads the chatbot's memory from Redis.                                      |
| getFullCostOfMemory           | memory: PsChatBotMemoryData           | number \| undefined                     | Calculates the full cost of the chatbot's memory.                           |
| loadMemory                    |                                       | Promise<PsChatBotMemoryData>            | Loads the chatbot's memory.                                                 |
| constructor                   | wsClientId: string, wsClients: Map<string, WebSocket>, memoryId: string \| undefined = undefined |                                         | Initializes a new instance of the PsBaseChatBot class.                      |
| setupMemory                   | memoryId: string \| undefined = undefined | Promise<void>                          | Sets up the chatbot's memory.                                               |
| fullLLMCostsForMemory         |                                       | number \| undefined                     | Gets the full LLM costs for the chatbot's memory.                           |
| getLoadedMemory               |                                       | Promise<PsChatBotMemoryData>            | Gets the loaded memory data.                                                |
| sendMemoryId                  |                                       | void                                    | Sends the memory ID to the client.                                          |
| saveMemory                    |                                       | Promise<void>                           | Saves the chatbot's memory to Redis.                                        |
| renderSystemPrompt            |                                       | string                                  | Renders the system prompt.                                                  |
| sendToClient                  | sender: string, message: string, type = "stream" | void                                    | Sends a message to the client.                                              |
| sendAgentStart                | name: string, hasNoStreaming = true   | void                                    | Sends an agent start message to the client.                                 |
| sendAgentCompleted            | name: string, lastAgent = false, error: string \| undefined = undefined | void                                    | Sends an agent completed message to the client.                             |
| sendAgentUpdate               | message: string                       | void                                    | Sends an agent update message to the client.                                |
| startBroadcastingLiveCosts    |                                       | void                                    | Starts broadcasting live costs.                                             |
| broadCastLiveCosts            |                                       | void                                    | Broadcasts live costs.                                                      |
| stopBroadcastingLiveCosts     |                                       | void                                    | Stops broadcasting live costs.                                              |
| emptyChatBotStagesData        |                                       | Record<PSChatBotMemoryStageTypes, IEngineInnovationStagesData> | Gets the empty chatbot stages data.                                         |
| getEmptyMemory                |                                       | PsChatBotMemoryData                     | Gets an empty memory data structure.                                        |
| streamWebSocketResponses      | stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | Promise<void>                           | Streams WebSocket responses.                                                |
| getTokenCosts                 | estimateTokens: number, type: "in" \| "out" | number                                  | Gets the token costs for a given text.                                      |
| addToExternalSolutionsMemoryCosts | text: string, type: "in" \| "out"    | void                                    | Adds costs to the external solutions memory.                                |
| saveMemoryIfNeeded            |                                       | Promise<void>                           | Saves the memory to Redis if needed.                                        |
| setChatLog                    | chatLog: PsSimpleChatLog[]            | Promise<void>                           | Sets the chat log and saves memory if needed.                               |
| conversation                  | chatLog: PsSimpleChatLog[]            | Promise<void>                           | Initiates a conversation with the GPT model and streams responses.          |

## Example

```typescript
import { PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';

// Example usage of PsBaseChatBot
const wsClients = new Map<string, WebSocket>();
const chatBot = new PsBaseChatBot('client-id', wsClients);

// Load memory from Redis
chatBot.loadMemory().then((memory) => {
  console.log('Loaded memory:', memory);
});

// Start a conversation
const chatLog = [
  { sender: 'user', message: 'Hello, chatbot!' }
];
chatBot.conversation(chatLog).then(() => {
  console.log('Conversation completed');
});
```