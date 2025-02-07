# BaseChatModel

The `BaseChatModel` is an abstract class that extends the `PolicySynthAgentBase`. It provides a foundation for implementing chat models with functionalities such as message generation, token estimation, and XML content processing.

## Properties

| Name         | Type                  | Description                                                                 |
|--------------|-----------------------|-----------------------------------------------------------------------------|
| modelName    | string \| TiktokenModel | The name or model type used for tokenization and processing.                |
| maxTokensOut | number                | The maximum number of tokens that can be output by the model. Default is 4096. |

## Constructor

### BaseChatModel

The constructor initializes a new instance of the `BaseChatModel` class.

#### Parameters

- `modelName: string | TiktokenModel` - The name or type of the model.
- `maxTokensOut: number` (optional) - The maximum number of tokens for output. Defaults to 4096.

## Methods

| Name                                 | Parameters                                                                 | Return Type                                                                 | Description                                                                 |
|--------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `generate`                           | `messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function` | `Promise<{ tokensIn: number; tokensOut: number; content: string } | undefined>` | Abstract method to generate content based on input messages.               |
| `getEstimatedNumTokensFromMessages`  | `messages: PsModelMessage[]`                                               | `Promise<number>`                                                           | Abstract method to estimate the number of tokens from input messages.       |
| `truncateXmlTags`                    | `text: string, maxChars: number = 500`                                     | `string`                                                                    | Truncates XML tags in the text to a specified maximum number of characters. |
| `prettyPrintPromptMessages`          | `messages: { role: string; content: string }[]`                            | `string`                                                                    | Formats and color-codes prompt messages for display.                        |
| `colorCodeXml`                       | `text: string`                                                             | `string`                                                                    | Color-codes XML tags in the text using `chalk`.                             |

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';

class MyChatModel extends BaseChatModel {
  constructor(modelName: string | TiktokenModel) {
    super(modelName);
  }

  async generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function) {
    // Implementation of the generate method
  }

  async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]) {
    // Implementation of the token estimation method
  }
}

const myModel = new MyChatModel("myModelName");
```