# PsBaseChatBot

This class represents a base chatbot that handles conversation with users through a WebSocket connection. It manages the conversation state and streams responses from the OpenAI API to the client.

## Properties

No public properties are documented.

## Methods

| Name                        | Parameters                                                                 | Return Type | Description                                                                                   |
|-----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| constructor                 | chatConversation: PsSimpleChatLog[], clientId: string, wsClients: Map<string, WebSocket> | void        | Initializes the chatbot with a conversation log, client ID, and a map of WebSocket clients.   |
| renderSystemPrompt          |                                                                            | string      | Returns a system prompt message to be displayed to the user.                                  |
| streamWebSocketResponses    | stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, clientId: string, wsClients: Map<string, WebSocket> | Promise<void> | Streams chat responses from the OpenAI API to the WebSocket client associated with the given client ID. |
| conversation                | clientId: string, wsClients: Map<string, WebSocket>, chatLog: PsSimpleChatLog[] | Promise<void> | Handles the conversation by sending messages to the OpenAI API and streaming the responses back to the client. |

## Examples

```typescript
// Example usage of the PsBaseChatBot class
import { PsBaseChatBot } from './PsBaseChatBot';
import WebSocket from 'ws';

const chatLog = [
  { sender: 'user', message: 'Hello, bot!' },
  // ... other messages in the conversation
];

const clientId = 'some-client-id';
const wsClients = new Map<string, WebSocket>();
// Assume wsClients is populated with WebSocket instances keyed by client IDs

const chatBot = new PsBaseChatBot(chatLog, clientId, wsClients);
```

**Note:** The `PsSimpleChatLog` type and other related types or interfaces are not defined in the provided code snippet. To generate complete documentation, these types should be provided.