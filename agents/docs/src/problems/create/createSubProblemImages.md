# CreateSubProblemImagesProcessor

This class extends `CreateSolutionImagesProcessor` to specifically handle the creation of images for sub-problems within a larger problem-solving context. It utilizes language models to generate prompts for Dalle-3 to create visual representations of sub-problems.

## Methods

| Name                    | Parameters                  | Return Type | Description                                                                 |
|-------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| renderCreatePrompt      | subProblemIndex: number     | Promise     | Generates a prompt for creating an image based on a sub-problem's details. |
| createSubProblemImages  |                             | Promise     | Iterates through sub-problems to create and store images for each.         |
| process                 |                             | Promise     | Initializes the process of creating sub-problem images.                    |

## Example

```javascript
// Example usage of CreateSubProblemImagesProcessor
import { CreateSubProblemImagesProcessor } from '@policysynth/agents/problems/create/createSubProblemImages.js';

const processor = new CreateSubProblemImagesProcessor();

processor.process()
  .then(() => console.log('Sub-problem images creation process completed.'))
  .catch(error => console.error('An error occurred:', error));
```