# BaseChatModel

An abstract base class for chat-based AI models in the PolicySynth agent framework. This class provides a foundation for implementing chat models with support for message formatting, XML tag truncation, and color-coded prompt debugging. It extends `PolicySynthAgentBase` and is designed to be subclassed for specific AI model providers.

**File:** `@policysynth/agents/aiModels/baseChatModel.js`

## Properties

| Name         | Type                        | Description                                                                                 |
|--------------|-----------------------------|---------------------------------------------------------------------------------------------|
| modelName    | `string \| TiktokenModel`   | The name or Tiktoken identifier of the model.                                               |
| maxTokensOut | `number`                    | The maximum number of output tokens the model can generate.                                 |
| provider     | `string \| undefined`       | (Optional) The provider name for the model (e.g., "openai", "azure").                       |
| config       | `PsAiModelConfig`           | The configuration object for the AI model.                                                  |
| dbModelId    | `number \| undefined`       | (Optional) The database model ID associated with this model instance.                       |

## Constructor

```typescript
constructor(
  config: PsAiModelConfig,
  modelName: string | TiktokenModel,
  maxTokensOut = 4096
)
```

- **config**: The configuration object for the AI model.
- **modelName**: The name or Tiktoken identifier of the model.
- **maxTokensOut**: (Optional) The maximum number of output tokens (default: 4096).

## Methods

| Name                    | Parameters                                                                                                                                                                                                                                   | Return Type                                 | Description                                                                                                 |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `generate` _(abstract)_ | `messages: PsModelMessage[]`,<br>`streaming?: boolean`,<br>`streamingCallback?: Function`,<br>`media?: { mimeType: string; data: string }[]`,<br>`tools?: ChatCompletionTool[]`,<br>`toolChoice?: ChatCompletionToolChoiceOption \| "auto"`,<br>`allowedTools?: string[]` | `Promise<PsBaseModelReturnParameters \| undefined>` | Abstract method to generate a model response. Must be implemented by subclasses.                            |
| `truncateXmlTags`       | `text: string`,<br>`maxChars = 500`                                                                                                                                                                                                         | `string`                                    | Truncates the inner text of XML tags in a string to a maximum number of characters, appending a notice.     |
| `prettyPrintPromptMessages` | `messages: { role: string; content: string }[]`                                                                                                                                                                                         | `string`                                    | Formats and color-codes an array of prompt messages for debugging, truncating XML tags as needed.           |
| `colorCodeXml`          | `text: string`                                                                                                                                                                                                                              | `string`                                    | Color-codes XML tags in a string using `chalk` for improved readability in the console.                     |

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';
import { PsAiModelConfig, PsModelMessage, PsBaseModelReturnParameters } from '@policysynth/agents/aiModels/types.js';

// Example subclass implementation
class MyOpenAiChatModel extends BaseChatModel {
  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function,
    media?: { mimeType: string; data: string }[],
    tools?: any[],
    toolChoice?: any,
    allowedTools?: string[]
  ): Promise<PsBaseModelReturnParameters | undefined> {
    // Implement the logic to call the OpenAI API here
    // Return a PsBaseModelReturnParameters object
    return {
      tokensIn: 100,
      tokensOut: 200,
      content: "Hello, world!"
    };
  }
}

// Usage
const config: PsAiModelConfig = {
  apiKey: "sk-...",
  modelName: "gpt-4",
  modelType: "chat",
  modelSize: "large",
  prices: {
    costInTokensPerMillion: 10,
    costOutTokensPerMillion: 20,
    costInCachedContextTokensPerMillion: 5,
    currency: "USD"
  }
};

const chatModel = new MyOpenAiChatModel(config, "gpt-4", 2048);

const messages: PsModelMessage[] = [
  { role: "user", message: "What is the capital of France?" }
];

chatModel.generate(messages).then(response => {
  console.log(response?.content); // "Hello, world!"
});

// Debugging prompt messages
console.log(chatModel.prettyPrintPromptMessages([
  { role: "user", content: "<question>What is the capital of France?</question>" }
]));
```

---

**Note:**  
- The `generate` method is abstract and must be implemented by subclasses for specific AI model providers.
- The `prettyPrintPromptMessages` and `colorCodeXml` methods are useful for debugging and inspecting prompt formatting, especially when working with XML-structured prompts.
- The `truncateXmlTags` method helps prevent excessively long XML content in debug output.