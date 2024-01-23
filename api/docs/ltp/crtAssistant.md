# OpenAI

This module provides an interface to the OpenAI API, including streaming capabilities, and utilities for working with the Logical Thinking Process (LTP) methodology.

## Properties

| Name                     | Type                                      | Description                                   |
|--------------------------|-------------------------------------------|-----------------------------------------------|
| DEBUGGING                | boolean                                   | Flag for enabling debugging logs.             |
| config                   | { apiKey: string }                        | Configuration object containing the API key.  |
| contextReplaceToken      | string                                    | Token used for replacing context in prompts.  |
| simpleTreeReplaceToken   | string                                    | Token used for replacing simplified tree in prompts. |
| simplifiedIdMap          | Record<string, number>                    | Map to store simplified IDs for nodes.        |
| simplifiedIdCounter      | number                                    | Counter for generating simplified IDs.        |

## Methods

| Name                            | Parameters                                                                 | Return Type | Description                                                                                   |
|---------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderFirstUserPromptWithTree   | currentUserMessage: string, currentRealityTree: LtpCurrentRealityTreeData, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a user prompt including the current reality tree and user message.                  |
| renderFirstUserPrompt           | effect: string, causes: string[], validationReview: string                 | string      | Generates a user prompt based on an effect, its causes, and an expert validation review.      |
| renderSystemPrompt              | -                                                                          | string      | Generates a system prompt to guide the creation of a Current Reality Tree.                    |
| getSimplifiedId                 | originalId: string                                                         | number      | Retrieves or generates a simplified ID for a given original ID.                               |
| simplifyTree                    | node: LtpCurrentRealityTreeDataNode, crtNodeId: string                     | LtpCrtSimplifiedForAI \| null | Simplifies a tree node for AI processing.                                                     |
| streamWebSocketResponses        | messages: any, stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, clientId: string, wsClients: Map<string, WebSocket>, systemPrompt: string | Promise<void> | Streams WebSocket responses from the OpenAI API to the client.                                |
| getRefinedCauses                | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, chatLog: PsSimpleChatLog[], parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined, customSystemPrompts: Map<number, string> \| undefined, effect?: string, causes?: string[], validationReview?: string | Promise<void> | Initiates the process to refine causes for a given effect in the context of a Current Reality Tree. |

## Examples

```typescript
// Example usage of rendering a system prompt
const systemPrompt = renderSystemPrompt();

// Example usage of getting refined causes
await getRefinedCauses(
  crtData, // LtpCurrentRealityTreeData
  'client-id-123', // clientId
  wsClientsMap, // Map<string, WebSocket>
  parentNode, // LtpCurrentRealityTreeDataNode
  'Current UDE', // currentUDE
  chatLog, // PsSimpleChatLog[]
  parentNodes, // LtpCurrentRealityTreeDataNode[] | undefined
  customSystemPrompts, // Map<number, string> | undefined
  'Effect description', // effect
  ['Cause 1', 'Cause 2'], // causes
  'Validation review' // validationReview
);
```

**Note:** The `LtpCurrentRealityTreeData`, `LtpCurrentRealityTreeDataNode`, `PsSimpleChatLog`, and `LtpCrtSimplifiedForAI` types are assumed to be defined elsewhere in the codebase and are not detailed here. The `Stream<OpenAI.Chat.Completions.ChatCompletionChunk>` type is part of the `openai` package.