# PsBaseChatBot

This class represents a base chatbot that integrates with OpenAI's GPT models and manages chat sessions, including memory persistence and live cost broadcasting.

## Properties

| Name                          | Type                                  | Description                                                                 |
|-------------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| wsClientId                    | string                                | WebSocket client ID.                                                        |
| wsClientSocket                | WebSocket                             | WebSocket client socket.                                                    |
| openaiClient                  | OpenAI                                | OpenAI client instance.                                                     |
| memory                        | PsChatBotMemoryData                   | Memory data for the chatbot session.                                        |
| broadcastingLiveCosts         | boolean                               | Flag to indicate if live costs are being broadcasted.                       |
| liveCostsBroadcastInterval    | number                                | Interval for broadcasting live costs.                                       |
| liveCostsInactivityTimeout    | number                                | Timeout for inactivity during live cost broadcasting.                       |
| static redisMemoryKeyPrefix   | string                                | Prefix for Redis memory keys.                                               |
| tempeture                     | number                                | Temperature setting for the chat model.                                     |
| maxTokens                     | number                                | Maximum number of tokens for the chat model.                                |
| llmModel                      | string                                | LLM model used for the chat.                                                |
| persistMemory                 | boolean                               | Flag to indicate if memory should be persisted.                             |
| memoryId                      | string \| undefined                   | ID for the chatbot memory.                                                  |
| liveCostsBroadcastTimeout     | NodeJS.Timeout \| undefined           | Timeout handle for live costs broadcasting.                                 |
| liveCostsBoadcastStartAt      | Date \| undefined                     | Start time for live costs broadcasting.                                     |
| lastSentToUserAt              | Date \| undefined                     | Last time a message was sent to the user.                                   |
| lastBroacastedCosts           | number \| undefined                   | Last broadcasted live costs.                                                |

## Methods

| Name                          | Parameters                            | Return Type                                     | Description                                                                 |
|-------------------------------|---------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------|
| redisKey                      |                                       | string                                          | Gets the Redis key for the chatbot memory.                                  |
| static loadMemoryFromRedis    | memoryId: string                      | Promise<PsChatBotMemoryData \| undefined>       | Loads chatbot memory from Redis.                                            |
| static getFullCostOfMemory    | memory: PsChatBotMemoryData           | number \| undefined                             | Calculates the full cost of the chatbot memory.                             |
| loadMemory                    |                                       | Promise<PsChatBotMemoryData>                    | Loads the chatbot memory.                                                   |
| constructor                   | wsClientId: string, wsClients: Map<string, WebSocket>, memoryId: string \| undefined | PsBaseChatBot | Initializes a new instance of the chatbot.                                 |
| setupMemory                   | memoryId: string \| undefined         | Promise<void>                                   | Sets up the chatbot memory.                                                 |
| fullLLMCostsForMemory         |                                       | number \| undefined                             | Gets the full LLM costs for the chatbot memory.                             |
| getLoadedMemory               |                                       | Promise<PsChatBotMemoryData>                    | Gets the loaded chatbot memory.                                             |
| sendMemoryId                  |                                       | void                                            | Sends the memory ID to the client.                                          |
| saveMemory                    |                                       | Promise<void>                                   | Saves the chatbot memory to Redis.                                          |
| renderSystemPrompt            |                                       | string                                          | Renders the system prompt for the chat.                                     |
| sendAgentStart                | name: string, hasNoStreaming: boolean | void                                            | Sends an agent start message to the client.                                 |
| sendAgentCompleted            | name: string, lastAgent: boolean, error: string \| undefined | void                | Sends an agent completed message to the client.                             |
| sendAgentUpdate               | message: string                       | void                                            | Sends an agent update message to the client.                                |
| startBroadcastingLiveCosts    |                                       | void                                            | Starts broadcasting live costs.                                             |
| broadCastLiveCosts            |                                       | void                                            | Broadcasts live costs to the client.                                        |
| stopBroadcastingLiveCosts     |                                       | void                                            | Stops broadcasting live costs.                                              |
| emptyChatBotStagesData        |                                       | Record<PSChatBotMemoryStageTypes, PsScStagesData> | Gets the empty chatbot stages data.                                         |
| getEmptyMemory                |                                       | PsChatBotMemoryData                             | Gets an empty chatbot memory object.                                        |
| sendToClient                  | sender: string, message: string, type: string | void                | Sends a message to the client.                                              |
| streamWebSocketResponses      | stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | Promise<void>         | Streams WebSocket responses from the OpenAI chat completions.               |
| getTokenCosts                 | estimateTokens: number, type: "in" \| "out" | number               | Gets the token costs for input or output text.                              |
| addToExternalSolutionsMemoryCosts | text: string, type: "in" \| "out" | void                    | Adds costs to the external solutions memory.                                |
| saveMemoryIfNeeded            |                                       | Promise<void>                                   | Saves the chatbot memory to Redis if needed.                                |
| setChatLog                    | chatLog: PsSimpleChatLog[]            | Promise<void>                                   | Sets the chat log for the chatbot session.                                  |
| conversation                  | chatLog: PsSimpleChatLog[]            | Promise<void>                                   | Starts a conversation with the chatbot.                                     |

## Examples

```typescript
import { PsBaseChatBot } from '@policysynth/apibase/chat/baseChatBot.js';

const wsClients = new Map<string, WebSocket>();
const chatBot = new PsBaseChatBot('client-id', wsClients);

chatBot.conversation([
  { sender: 'user', message: 'Hello, chatbot!' }
]).then(() => {
  console.log('Conversation started.');
});
```