# BaseChatModel

The `BaseChatModel` is an abstract class that provides a foundation for chat models. It defines the basic properties and methods that any chat model should implement.

## Properties

| Name         | Type                | Description                                      |
|--------------|---------------------|--------------------------------------------------|
| modelName    | string \| TiktokenModel | The name of the model or a TiktokenModel instance. |
| maxTokensOut | number              | The maximum number of tokens that can be output. |

## Constructor

| Parameters   | Type                | Description                                      |
|--------------|---------------------|--------------------------------------------------|
| modelName    | string \| TiktokenModel | The name of the model or a TiktokenModel instance. |
| maxTokensOut | number              | The maximum number of tokens that can be output. Defaults to 4096. |

## Methods

| Name                               | Parameters                                                                 | Return Type                                                                 | Description                                                                 |
|------------------------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| generate                           | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function | Promise<{tokensIn: number, tokensOut: number, content: string} \| undefined> | Abstract method to generate a response based on the provided messages.      |
| getEstimatedNumTokensFromMessages  | messages: PsModelMessage[]                                                | Promise<number>                                                             | Abstract method to estimate the number of tokens from the provided messages. |

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';
import { PsModelMessage } from '@policysynth/agents/aiModels/types.js';

class MyChatModel extends BaseChatModel {
  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<{tokensIn: number, tokensOut: number, content: string} | undefined> {
    // Implementation here
  }

  async getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number> {
    // Implementation here
  }
}

const model = new MyChatModel('my-model', 2048);
const messages: PsModelMessage[] = [{ role: 'user', message: 'Hello!' }];
model.generate(messages).then(response => {
  console.log(response);
});
```

This example demonstrates how to extend the `BaseChatModel` class and implement its abstract methods.