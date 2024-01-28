# createEmbedding

Creates an embedding for the given text using OpenAI's API.

## Methods

| Name            | Parameters     | Return Type                                      | Description                                      |
|-----------------|----------------|--------------------------------------------------|--------------------------------------------------|
| createEmbedding | text: string   | Promise<{ embeddings: number[], totalTokens: number }> | Asynchronously generates an embedding for the provided text. |

## Examples

```typescript
import { createEmbedding } from '@policysynth/apiopenai/embeddings.js';

async function run() {
  const text = "The quick brown fox jumps over the lazy dog";
  const result = await createEmbedding(text);
  console.log(result);
}

run();
```