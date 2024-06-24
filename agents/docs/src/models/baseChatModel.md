# BaseChatModel

The `BaseChatModel` is an abstract class that serves as a base for chat models. It defines the structure and essential methods that any derived chat model should implement.

## Properties

| Name         | Type                     | Description                                      |
|--------------|--------------------------|--------------------------------------------------|
| modelName    | string \| TiktokenModel  | The name of the model or an instance of `TiktokenModel`. |
| maxTokensOut | number                   | The maximum number of tokens that can be output. Defaults to 4096. |

## Methods

| Name                      | Parameters                                                                 | Return Type       | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| constructor               | modelName: string \| TiktokenModel, maxTokensOut?: number                   | void              | Initializes a new instance of the `BaseChatModel` class.                    |
| generate                  | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function | Promise<any>      | Abstract method to generate a response based on the provided messages.      |
| getNumTokensFromMessages  | messages: PsModelMessage[]                                                | Promise<number>   | Abstract method to get the number of tokens from the provided messages.     |

## Example

```typescript
import { BaseChatModel } from '@policysynth/agents/models/baseChatModel.js';

class MyChatModel extends BaseChatModel {
  async generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any> {
    // Implementation here
  }

  async getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    // Implementation here
  }
}

const myModel = new MyChatModel("myModelName");
```