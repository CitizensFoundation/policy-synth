# OpenAI

This class encapsulates the functionality to interact with the OpenAI API for creating text embeddings.

## Properties

No properties are explicitly defined in this snippet.

## Methods

| Name             | Parameters       | Return Type                             | Description                                      |
|------------------|------------------|-----------------------------------------|--------------------------------------------------|
| createEmbedding  | text: string     | Promise<{embeddings: number[], totalTokens: number}> | Asynchronously creates a text embedding using the OpenAI API. |

## Examples

```typescript
import { createEmbedding } from "./path-to-your-file";

// Example usage of createEmbedding
const text = "The quick brown fox jumps over the lazy dog";
createEmbedding(text).then(embeddingData => {
  console.log(embeddingData.embeddings); // The numerical embedding array
  console.log(embeddingData.totalTokens); // The total number of tokens used
});
```