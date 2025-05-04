# BaseChatModel

An abstract base class for chat-based AI models in the PolicySynth agent framework. This class provides utility methods for handling prompts, formatting, and XML tag truncation, and defines the interface for generating model responses.

**File:** `@policysynth/agents/aiModels/baseChatModel.js`

## Properties

| Name         | Type                        | Description                                              |
|--------------|-----------------------------|----------------------------------------------------------|
| modelName    | `string \| TiktokenModel`   | The name or token model identifier for the chat model.   |
| maxTokensOut | `number`                    | The maximum number of output tokens for the model.       |
| provider     | `string \| undefined`       | (Optional) The provider name for the model.              |

## Constructor

```typescript
constructor(modelName: string | TiktokenModel, maxTokensOut = 4096)
```
- **modelName**: The name or TiktokenModel instance for the chat model.
- **maxTokensOut**: (Optional) Maximum output tokens. Defaults to 4096.

## Methods

| Name                     | Parameters                                                                                                                                         | Return Type                                                                 | Description                                                                                                   |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `generate` (abstract)    | `messages: PsModelMessage[]`, `streaming?: boolean`, `streamingCallback?: Function`                                                                | `Promise<{ tokensIn: number; tokensOut: number; content: string } \| undefined>` | Abstract method. Generates a model response given a list of messages. Must be implemented by subclasses.      |
| `truncateXmlTags`        | `text: string`, `maxChars = 500`                                                                                                                  | `string`                                                                     | Truncates the inner text of XML tags in a string to a maximum number of characters, appending a notice if truncated. |
| `prettyPrintPromptMessages` | `messages: { role: string; content: string }[]`                                                                                                 | `string`                                                                     | Formats and color-codes a list of prompt messages for pretty-printing, truncating XML tags as needed.         |
| `colorCodeXml`           | `text: string`                                                                                                                                    | `string`                                                                     | Color-codes XML tags in a string using `chalk` for improved readability in the console.                       |

## Method Details

### `generate` (abstract)

```typescript
abstract generate(
  messages: PsModelMessage[],
  streaming?: boolean,
  streamingCallback?: Function
): Promise<{ tokensIn: number; tokensOut: number; content: string } | undefined>;
```
- **messages**: Array of messages (role and message) to send to the model.
- **streaming**: (Optional) Whether to use streaming output.
- **streamingCallback**: (Optional) Callback function for streaming output.
- **Returns**: A promise resolving to an object with `tokensIn`, `tokensOut`, and `content`, or `undefined`.

### `truncateXmlTags`

```typescript
truncateXmlTags(text: string, maxChars = 500): string
```
- Truncates the inner text of XML tags in the input string to `maxChars` characters, appending a `[TRUNCATED: N chars]` notice if truncated.

### `prettyPrintPromptMessages`

```typescript
prettyPrintPromptMessages(messages: { role: string; content: string }[]): string
```
- Formats an array of prompt messages, truncates XML tags, color-codes XML, and returns a pretty-printed string for display.

### `colorCodeXml`

```typescript
colorCodeXml(text: string): string
```
- Uses `chalk` to colorize XML tags in the input string for improved console readability.

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';

class MyChatModel extends BaseChatModel {
  async generate(messages, streaming = false, streamingCallback) {
    // Implement your model's message generation logic here
    return {
      tokensIn: 100,
      tokensOut: 120,
      content: "<response>Hello, world!</response>"
    };
  }
}

const model = new MyChatModel("gpt-4", 2048);

const messages = [
  { role: "user", content: "<prompt>Hello, AI!</prompt>" }
];

console.log(model.prettyPrintPromptMessages(messages));
// Output: Colorized, pretty-printed prompt messages with XML tags truncated if needed

model.generate(messages).then(result => {
  console.log(result.content); // <response>Hello, world!</response>
});
```

---

**Note:**  
- This class is abstract and must be extended. The `generate` method must be implemented in subclasses.
- Utility methods are provided for prompt formatting and XML tag handling, useful for debugging and logging.