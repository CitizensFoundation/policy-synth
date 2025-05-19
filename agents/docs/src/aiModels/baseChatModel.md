# BaseChatModel

An abstract base class for chat-based AI models in the PolicySynth agent framework. It provides utility methods for prompt formatting, XML tag truncation, and colorized output for debugging. Subclasses must implement the `generate` method to interact with specific AI models.

## Properties

| Name         | Type                        | Description                                                                                 |
|--------------|-----------------------------|---------------------------------------------------------------------------------------------|
| modelName    | string \| TiktokenModel     | The name or Tiktoken identifier of the model.                                               |
| maxTokensOut | number                      | The maximum number of output tokens the model can generate.                                 |
| provider     | string \| undefined         | (Optional) The provider of the model (e.g., "openai", "anthropic").                         |
| config       | PsAiModelConfig             | The configuration object for the AI model, including API keys, model type, and other params.|

## Methods

| Name                     | Parameters                                                                                                                                         | Return Type                              | Description                                                                                                   |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor              | config: PsAiModelConfig, modelName: string \| TiktokenModel, maxTokensOut?: number                                                                 | BaseChatModel                            | Constructs a new BaseChatModel instance.                                                                      |
| generate (abstract)      | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function                                                                      | Promise&lt;PsBaseModelReturnParameters \| undefined&gt; | Abstract method. Generates a model response given a list of messages. Must be implemented by subclasses.      |
| truncateXmlTags          | text: string, maxChars?: number                                                                                                                    | string                                   | Truncates the content inside XML tags in the given text to a maximum number of characters.                    |
| prettyPrintPromptMessages| messages: { role: string; content: string }[]                                                                                                      | string                                   | Formats and color-codes a list of prompt messages for pretty-printing (e.g., for debugging).                  |
| colorCodeXml             | text: string                                                                                                                                       | string                                   | Color-codes XML tags in the given text using [chalk](https://www.npmjs.com/package/chalk) for terminal output.|

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';
import { PsAiModelConfig, PsModelMessage } from '@policysynth/agents/aiModels/aiModelTypes.js';

// Example subclass implementing the abstract generate method
class MyChatModel extends BaseChatModel {
  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<PsBaseModelReturnParameters | undefined> {
    // Implement your model call here
    return {
      tokensIn: 100,
      tokensOut: 50,
      content: "Hello, world!"
    };
  }
}

// Usage
const config: PsAiModelConfig = {
  apiKey: "sk-...",
  modelType: "openai",
  modelSize: "large",
  modelName: "gpt-4"
  // ...other config
};

const model = new MyChatModel(config, "gpt-4", 4096);

const messages: PsModelMessage[] = [
  { role: "system", message: "<prompt>Hello</prompt>" },
  { role: "user", message: "<question>What is AI?</question>" }
];

const pretty = model.prettyPrintPromptMessages(
  messages.map(m => ({ role: m.role, content: m.message }))
);
console.log(pretty);

model.generate(messages).then(response => {
  console.log(response?.content);
});
```

---

**Note:**  
- This class is intended to be subclassed for specific AI model providers.
- The `generate` method must be implemented in subclasses to provide actual model inference logic.
- Utility methods like `truncateXmlTags` and `prettyPrintPromptMessages` are useful for debugging and prompt engineering.