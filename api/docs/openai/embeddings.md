# createEmbedding

Creates an embedding for the given text using OpenAI's API.

## Methods

| Name            | Parameters     | Return Type                                      | Description                                      |
|-----------------|----------------|--------------------------------------------------|--------------------------------------------------|
| createEmbedding | text: string   | Promise<{ embeddings: number[], totalTokens: number }> | Asynchronously generates an embedding for the provided text. |

## Examples

```
// Example usage of createEmbedding
import { createEmbedding } from '@policysynth/api/openai/embeddings.js';

const text = "Hello, world!";
const embedding = await createEmbedding(text);

console.log(embedding);
```