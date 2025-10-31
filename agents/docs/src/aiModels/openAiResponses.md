# OpenAiResponses

A class that provides an interface-compatible implementation with OpenAI's Chat Completions API, but uses the OpenAI **Responses API**. It is designed to work as a drop-in replacement for OpenAI chat models, with support for tool calls, tool outputs, and image/media input, and is optimized for reasoning models that use `previous_response_id` for stateful conversations.

**File:** `@policysynth/agents/aiModels/openAiResponses.js`

## Inheritance

- Extends: [`BaseChatModel`](./baseChatModel.js)

## Properties

| Name                      | Type                        | Description                                                                                 |
|---------------------------|-----------------------------|---------------------------------------------------------------------------------------------|
| `client`                  | `OpenAI`                    | The OpenAI client instance.                                                                 |
| `cfg`                     | `PsOpenAiModelConfig`       | The configuration object for the model.                                                     |
| `previousResponseId`      | `string \| undefined`       | The ID of the previous response, used for stateful reasoning models.                        |
| `sentToolOutputIds`       | `Set<string>`               | Tracks tool output IDs that have already been sent to avoid duplication.                    |
| `lastSubmittedMessageCount`| `number`                   | The number of messages submitted in the last request, for delta tracking.                   |

## Constructor

```typescript
constructor(config: PsOpenAiModelConfig)
```
- Initializes the OpenAiResponses instance with the given configuration.
- Handles API key overrides from environment variables.
- Sets up the OpenAI client and internal state.

## Methods

| Name                                | Parameters                                                                                                                                                                                                                       | Return Type                      | Description                                                                                                   |
|------------------------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------------------------------------|
| `generate`                          | `messages: PsModelMessage[]`,<br>`streaming?: boolean`,<br>`streamingCallback?: (chunk: string) => void`,<br>`media?: { mimeType: string; data: string }[]`,<br>`tools?: ChatCompletionTool[]`,<br>`toolChoice?: ChatCompletionToolChoiceOption \| "auto"`,<br>`allowedTools?: string[]` | `Promise<PsBaseModelReturnParameters>` | Main entry point. Generates a chat completion using the Responses API, with support for streaming, tools, and media. |
| `attachImagesToLastUserMessage`      | `inputItems: any[]`,<br>`images?: ImageRef[]`,<br>`detail?: "low" \| "medium" \| "high" \| "auto"`                                                                                       | `void`                           | Attaches image references to the last user message in the input items, for multimodal input.                  |
| `mapToolsForResponses`               | `tools: ChatCompletionTool[]`                                                                                                                                                             | `any[]`                          | Maps OpenAI Chat Completions tool definitions to Responses API tool definitions.                              |
| `mapToolChoiceForResponses`          | `toolChoice: ChatCompletionToolChoiceOption \| "auto"`                                                                                                                                    | `any`                            | Maps the tool choice option from Chat Completions to Responses API format.                                    |
| `preprocessForResponses`             | `msgs: PsModelMessage[]`,<br>`hasPreviousResponses: boolean`,<br>`lastSubmittedMessageCount: number`                                                                                      | `{ inputItems: any[]; instructions?: string; pendingToolCallIds: string[] }` | Prepares the input items and instructions for the Responses API, handling tool outputs and message deltas.    |
| `handleStreaming`                    | `params: any`,<br>`onChunk?: (c: string) => void`                                                                                                                                        | `Promise<PsBaseModelReturnParameters>` | Handles streaming responses from the Responses API, calling the callback for each chunk.                      |
| `handleNonStreaming`                 | `params: any`                                                                                                                                                                            | `Promise<PsBaseModelReturnParameters>` | Handles non-streaming (single-shot) responses from the Responses API.                                         |
| `extractTextFromResponse`            | `resp: any`                                                                                                                                                                              | `string`                         | Extracts the text content from a Responses API response object.                                               |
| `extractToolCallsFromResponse`       | `resp: any`                                                                                                                                                                              | `ToolCall[]`                     | Extracts tool call information from a Responses API response object.                                          |

## Example

```typescript
import { OpenAiResponses } from '@policysynth/agents/aiModels/openAiResponses.js';

const config = {
  apiKey: 'sk-...',
  modelName: 'gpt-4o',
  modelType: 'textReasoning',
  maxTokensOut: 4096,
  temperature: 0.7,
  // ...other PsOpenAiModelConfig fields
};

const model = new OpenAiResponses(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the capital of France?' }
];

const result = await model.generate(messages);

console.log(result.content); // "The capital of France is Paris."
```

## Usage Notes

- **Tool Calls:** Supports OpenAI function/tool calling, mapping tool definitions and tool choices to the Responses API format.
- **Stateful Reasoning:** Maintains `previousResponseId` for models that support stateful reasoning, and handles message history truncation.
- **Media Input:** Supports attaching images to user messages for multimodal models.
- **Streaming:** Supports both streaming and non-streaming completions, with chunk callbacks for streaming.
- **Token Usage:** Returns detailed token usage statistics in the result.

## Types

- `ImageRef`: `{ mimeType: string; data: string } | { url: string }`
- `PsModelMessage`, `PsBaseModelReturnParameters`, `ToolCall`, `PsOpenAiModelConfig`: See project type definitions.

---

**See also:**  
- [`BaseChatModel`](./baseChatModel.js)  
- [OpenAI Responses API documentation](https://platform.openai.com/docs/api-reference/responses)  
- [OpenAI Chat Completions API documentation](https://platform.openai.com/docs/api-reference/chat/create)