# CreateSubProblemImagesProcessor

The `CreateSubProblemImagesProcessor` class is responsible for generating visual prompts for Dalle-3 based on sub-problem statements and creating images for each sub-problem in a project. It extends the `CreateSolutionImagesProcessor` class.

## Properties

| Name                     | Type   | Description                                       |
|--------------------------|--------|---------------------------------------------------|
| currentSubProblemIndex   | number | Index of the current sub-problem being processed. |

## Methods

| Name                     | Parameters | Return Type | Description                                                                                   |
|--------------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| renderCreatePrompt       | subProblemIndex: number | Promise<any> | Generates a prompt for creating a Dalle-3 image based on the sub-problem at the given index. |
| createSubProblemImages   |            | Promise<void> | Creates images for all sub-problems in the project.                                           |
| process                  |            | Promise<void> | Main processing method that orchestrates the creation of sub-problem images.                  |

## Examples

```typescript
// Example usage of the CreateSubProblemImagesProcessor
const processor = new CreateSubProblemImagesProcessor();
processor.process().then(() => {
  console.log('Sub-problem images have been created.');
}).catch(error => {
  console.error('An error occurred while creating sub-problem images:', error);
});
```