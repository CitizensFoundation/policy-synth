# PsAiModelType

Enumeration representing different types of AI models.

## Values

| Name        | Value        | Description                        |
|-------------|--------------|------------------------------------|
| Embedding   | "embedding"  | Represents an embedding model.     |
| Text        | "text"       | Represents a text model.           |
| MultiModal  | "multiModal" | Represents a multi-modal model.    |
| Audio       | "audio"      | Represents an audio model.         |
| Video       | "video"      | Represents a video model.          |
| Image       | "image"      | Represents an image model.         |

## Example

```typescript
import { PsAiModelType } from '@policysynth/agents/aiModelTypes.js';

const modelType: PsAiModelType = PsAiModelType.Text;
console.log(modelType); // Output: "text"
```

# PsAiModelSize

Enumeration representing different sizes of AI models.

## Values

| Name   | Value   | Description                    |
|--------|---------|--------------------------------|
| Large  | "large" | Represents a large model size. |
| Medium | "medium"| Represents a medium model size.|
| Small  | "small" | Represents a small model size. |

## Example

```typescript
import { PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

const modelSize: PsAiModelSize = PsAiModelSize.Large;
console.log(modelSize); // Output: "large"
```

## Usage Example

```typescript
import { PsAiModelType, PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

const modelConfiguration = {
  type: PsAiModelType.Text,
  size: PsAiModelSize.Medium
};

console.log(`Model Type: ${modelConfiguration.type}, Model Size: ${modelConfiguration.size}`);
// Output: Model Type: text, Model Size: medium
```