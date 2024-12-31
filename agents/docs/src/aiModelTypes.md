# PsAiModelType

The `PsAiModelType` is an enumeration that defines the various types of AI models that can be used within the system. Each type represents a different kind of AI capability, such as text processing, image recognition, or audio analysis.

## Enum Values

| Name                  | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `Embedding`           | Represents models that generate embeddings, which are vector representations of data. |
| `Text`                | Represents models that process and generate text.                           |
| `MultiModal`          | Represents models that can handle multiple types of data inputs, such as text and images. |
| `Audio`               | Represents models that process and analyze audio data.                      |
| `Video`               | Represents models that process and analyze video data.                      |
| `Image`               | Represents models that process and analyze image data.                      |
| `TextReasoning`       | Represents models that perform reasoning tasks on text data.                |
| `MultiModalReasoning` | Represents models that perform reasoning tasks on multiple types of data.   |

## Example

```typescript
import { PsAiModelType } from '@policysynth/agents/aiModelTypes.js';

const modelType: PsAiModelType = PsAiModelType.Text;
console.log(modelType); // Output: "text"
```

# PsAiModelSize

The `PsAiModelSize` is an enumeration that defines the size of AI models. The size typically correlates with the model's capacity and computational requirements.

## Enum Values

| Name    | Description                                      |
|---------|--------------------------------------------------|
| `Large` | Represents a large-sized AI model.               |
| `Medium`| Represents a medium-sized AI model.              |
| `Small` | Represents a small-sized AI model.               |

## Example

```typescript
import { PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

const modelSize: PsAiModelSize = PsAiModelSize.Large;
console.log(modelSize); // Output: "large"
```

These enumerations are used to specify the type and size of AI models in various configurations and settings within the system.