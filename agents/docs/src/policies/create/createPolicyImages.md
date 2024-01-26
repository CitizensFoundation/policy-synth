# CreatePolicyImagesProcessor

This class extends `CreateSolutionImagesProcessor` to specifically handle the creation of images for policies. It utilizes language models and image generation APIs to render visual representations of policy components.

## Methods

| Name                          | Parameters                                      | Return Type | Description                                                                 |
|-------------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderCreatePolicyImagePrompt | subProblemIndex: number, policy: PSPolicy, injectText?: string | Promise<SystemMessage[] \| HumanMessage[]> | Generates the prompt for creating an image based on a policy component.     |
| createPolicyImages            |                                                 | Promise<void> | Iterates over policies to create images for each, handling file operations and API interactions. |
| process                       |                                                 | Promise<void> | Orchestrates the process of generating images for policies.                 |

## Example

```javascript
import { CreatePolicyImagesProcessor } from '@policysynth/agents/policies/create/createPolicyImages.js';

const processor = new CreatePolicyImagesProcessor();

processor.process()
  .then(() => console.log('Finished creating policy images.'))
  .catch(error => console.error('Error creating policy images:', error));
```