# OpenAI

This class provides an interface to the OpenAI API.

## Properties

| Name      | Type   | Description               |
|-----------|--------|---------------------------|
| config    | object | Configuration for the API including the API key. |

## Methods

| Name                            | Parameters                                                                 | Return Type | Description                                                                                   |
|---------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderFirstUserPromptWithTree   | currentUserMessage: string, currentRealityTree: LtpCurrentRealityTreeData, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a user prompt including the current reality tree and the user's message.             |
| renderFirstUserPrompt           | effect: string, causes: string[], validationReview: string                 | string      | Generates a user prompt based on an effect, its causes, and an expert validation review.      |
| renderSystemPrompt              |                                                                            | string      | Generates a system prompt to guide the creation of a Current Reality Tree.                    |
| getSimplifiedId                 | originalId: string                                                         | number      | Retrieves a simplified ID for a given original ID, creating a new one if necessary.           |
| simplifyTree                    | node: LtpCurrentRealityTreeDataNode, crtNodeId: string                     | LtpCrtSimplifiedForAI \| null | Simplifies a tree node for AI processing.                                                     |
| streamWebSocketResponses        | messages: any, stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, clientId: string, wsClients: Map<string, WebSocket>, systemPrompt: string | Promise<void> | Streams WebSocket responses from the OpenAI API to the client.                                 |
| getRefinedCauses                | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, chatLog: PsSimpleChatLog[], parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined, customSystemPrompts: Map<number, string> \| undefined, effect?: string, causes?: string[], validationReview?: string | Promise<void> | Initiates the process to refine causes for a Current Reality Tree and streams the results.     |

## Examples

```typescript
// Example usage of the OpenAI class to generate a user prompt with a current reality tree
const userPrompt = renderFirstUserPromptWithTree(
  "The machine stops frequently",
  currentRealityTreeData,
  parentNodeData,
  "Frequent machine stoppages",
  parentNodesData
);
```

```typescript
// Example usage of the OpenAI class to stream WebSocket responses
streamWebSocketResponses(
  messages,
  openAIStream,
  "client-id-123",
  wsClientsMap,
  systemPrompt
);
```

```typescript
// Example usage of the OpenAI class to get refined causes for a Current Reality Tree
getRefinedCauses(
  crtData,
  "client-id-123",
  wsClientsMap,
  parentNodeData,
  "Frequent machine stoppages",
  chatLogData,
  parentNodesData
);
```

# Stream

This class is part of the `openai/streaming.mjs` module and is used for streaming data from the OpenAI API.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

# hrtime

This is a Node.js process method used to get high-resolution real time. It is not a class and does not have properties or methods.

# uuidv4

This function generates a random UUID (Universally Unique Identifier) according to RFC4122.

## Properties

No properties are documented for this function.

## Methods

No methods are documented for this function.

## Examples

```typescript
// Example usage of uuidv4 to generate a unique identifier
const uniqueId = uuidv4();
```

# WebSocket

This class provides a client for connecting to WebSocket servers.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Examples

```typescript
// Example usage of WebSocket to connect to a WebSocket server
const ws = new WebSocket('ws://www.host.com/path');
```