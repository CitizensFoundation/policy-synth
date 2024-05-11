# CreatePolicyImagesProcessor

This class extends `CreateSolutionImagesProcessor` to handle the creation of images for policy components using Dall-E 2 prompts.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for generating prompts. |

## Methods

| Name                          | Parameters                                    | Return Type | Description                 |
|-------------------------------|-----------------------------------------------|-------------|-----------------------------|
| renderCreatePolicyImagePrompt | subProblemIndex: number, policy: PSPolicy, injectText?: string | Promise<SystemMessage[] \| HumanMessage[]> | Generates a set of messages including a Dall-E 2 prompt based on the policy details. |
| createPolicyImages            | -                                             | Promise<void> | Processes all sub-problems to create images for each policy. |
| process                       | -                                             | Promise<void> | Main method to start the image creation process for policies. |

## Example

```typescript
// Example usage of CreatePolicyImagesProcessor
import { CreatePolicyImagesProcessor } from '@policysynth/agents/policies/create/createPolicyImages.js';

const processor = new CreatePolicyImagesProcessor();
processor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```