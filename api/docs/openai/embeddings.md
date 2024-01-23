# OpenAI

This class represents a wrapper for the OpenAI API, providing methods to interact with the OpenAI service.

## Properties

No properties are documented for this class.

## Methods

| Name             | Parameters       | Return Type                         | Description                                      |
|------------------|------------------|-------------------------------------|--------------------------------------------------|
| createEmbedding  | text: string     | Promise<{embeddings: number[], totalTokens: number}> | Asynchronously creates a text embedding using the OpenAI API. |

## Examples

```typescript
import { createEmbedding } from "./path_to_file";

// Example usage of createEmbedding
const text = "The quick brown fox jumps over the lazy dog";
createEmbedding(text).then(response => {
  console.log("Embeddings:", response.embeddings);
  console.log("Total Tokens:", response.totalTokens);
}).catch(error => {
  console.error("Error creating embedding:", error);
});
```