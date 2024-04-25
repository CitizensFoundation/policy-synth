# CreateSolutionImagesProcessor

This class is responsible for creating images for solutions using Stability AI or OpenAI's DALL-E, downloading these images, and uploading them to an S3 bucket. It extends the `BaseProblemSolvingAgent` class.

## Properties

| Name                | Type                      | Description                                                                 |
|---------------------|---------------------------|-----------------------------------------------------------------------------|
| cloudflareProxy     | string                    | URL to the Cloudflare proxy.                                                |
| subProblemColors    | Array<string>             | List of colors for sub-problems.                                            |
| secondaryColors     | Array<string>             | List of secondary colors.                                                   |

## Methods

| Name                        | Parameters                                                                                                    | Return Type                  | Description                                                                                   |
|-----------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------|-----------------------------------------------------------------------------------------------|
| downloadImage               | imageUrl: string, imageFilePath: string                                                                       | Promise<void>                | Downloads an image from a given URL and saves it to a specified path.                        |
| downloadStabilityImage      | subProblemIndex: number, imagePrompt: string, imageFilePath: string, solutionOrPolicy: IEngineSolution \| PSPolicy \| undefined = undefined, stylePreset: "digital-art" \| "low-poly" \| "pixel-art" \| "sketch" = "digital-art" | Promise<boolean>             | Downloads an image from Stability AI based on a given prompt and saves it to a specified path.|
| uploadImageToS3             | bucket: string, filePath: string, key: string                                                                  | Promise<any>                 | Uploads a file to an S3 bucket and deletes the local file.                                   |
| randomSecondaryColor        |                                                                                                               | string                       | Gets a random secondary color.                                                               |
| getSubProblemColor          | subProblemIndex: number                                                                                       | string                       | Gets the color for a sub-problem based on its index.                                         |
| renderCreatePrompt          | subProblemIndex: number, solution: IEngineSolution \| PSPolicy, injectText?: string                           | Promise<Array<SystemMessage \| HumanMessage>> | Prepares the prompt for creating an image based on a solution or policy.                      |
| getImageUrlFromPrompt       | prompt: string                                                                                                | Promise<string \| undefined> | Generates an image URL from a given prompt using OpenAI's DALL-E.                             |
| createImages                |                                                                                                               | Promise<void>                | Creates images for all solutions in the current memory.                                       |
| process                     |                                                                                                               | void                         | Processes the creation of images for solutions. Extends the `process` method from the base class. |

## Example

```javascript
// Example usage of CreateSolutionImagesProcessor
import { CreateSolutionImagesProcessor } from '@policysynth/agents/solutions/create/createImages.js';

const createImagesProcessor = new CreateSolutionImagesProcessor();

createImagesProcessor.process().then(() => {
  console.log("Finished processing images.");
}).catch(error => {
  console.error("Error processing images:", error);
});
```