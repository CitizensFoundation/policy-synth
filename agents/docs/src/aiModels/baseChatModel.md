# BaseChatModel

The `BaseChatModel` is an abstract class that extends the `PolicySynthAgentBase`. It serves as a foundational class for chat models, providing basic properties and abstract methods that need to be implemented by subclasses.

## Properties

| Name         | Type                      | Description                                                                 |
|--------------|---------------------------|-----------------------------------------------------------------------------|
| modelName    | `string \| TiktokenModel` | The name of the model or a TiktokenModel instance used for tokenization.    |
| maxTokensOut | `number`                  | The maximum number of tokens that can be output by the model. Default is 4096. |

## Constructor

### BaseChatModel

The constructor initializes a new instance of the `BaseChatModel` class.

#### Parameters

- `modelName: string | TiktokenModel` - The name of the model or a TiktokenModel instance.
- `maxTokensOut: number` (optional) - The maximum number of tokens that can be output by the model. Defaults to 4096.

## Methods

| Name                                 | Parameters                                                                 | Return Type                                                                 | Description                                                                 |
|--------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `generate`                           | `messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function` | `Promise<{tokensIn: number, tokensOut: number, content: string} \| undefined>` | Abstract method to generate a response based on input messages.             |
| `getEstimatedNumTokensFromMessages`  | `messages: PsModelMessage[]`                                               | `Promise<number>`                                                           | Abstract method to estimate the number of tokens from a list of messages.   |

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';

class CustomChatModel extends BaseChatModel {
  constructor(modelName: string | TiktokenModel) {
    super(modelName);
  }

  async generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{tokensIn: number, tokensOut: number, content: string} | undefined> {
    // Implementation of the generate method
  }

  async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    // Implementation of the token estimation method
  }
}
```

In this example, `CustomChatModel` extends `BaseChatModel` and provides implementations for the abstract methods `generate` and `getEstimatedNumTokensFromMessages`.