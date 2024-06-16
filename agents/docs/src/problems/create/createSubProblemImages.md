# CreateSubProblemImagesProcessor

This class extends `CreateSolutionImagesProcessor` to handle the creation of images for sub-problems using Dalle-3 prompts. It manages the generation, downloading, and uploading of images specific to sub-problems in a problem-solving context.

## Properties

| Name                     | Type   | Description               |
|--------------------------|--------|---------------------------|
| recreateImagesNeeded     | boolean | Static flag to determine if images need to be recreated. |

## Methods

| Name                     | Parameters                                | Return Type | Description                 |
|--------------------------|-------------------------------------------|-------------|-----------------------------|
| renderCreatePrompt       | subProblemIndex: number                   | Promise<SystemMessage[] \| HumanMessage[]> | Generates the prompt messages for creating sub-problem images. |
| createSubProblemImages   |                                           | Promise<void> | Manages the creation of images for all sub-problems. |
| process                  |                                           | Promise<void> | Initiates the sub-problem image creation process. |
| downloadStabilityImage   | subProblemIndex: number, imagePrompt: string, imageFilePath: string | Promise<void> | Downloads an image from Stability API and saves it locally. |
| getImageUrlFromPrompt    | imagePrompt: string                       | Promise<string> | Retrieves an image URL based on the provided prompt. |
| downloadImage            | imageUrl: string, imageFilePath: string  | Promise<void> | Downloads an image from the given URL and saves it locally. |
| uploadImageToS3          | bucketName: string, localPath: string, s3Path: string | Promise<void> | Uploads a local image file to an AWS S3 bucket. |
| saveMemory               |                                           | Promise<void> | Saves the current state of memory to a persistent storage. |

## Example

```typescript
import { CreateSubProblemImagesProcessor } from '@policysynth/agents/problems/create/createSubProblemImages.js';
import { PsConstants } from '@policysynth/agents/constants.js';
import AWS from 'aws-sdk';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Example usage of CreateSubProblemImagesProcessor
const processor = new CreateSubProblemImagesProcessor();

processor.process().then(() => {
  console.log('Sub-problem images creation process completed.');
}).catch(error => {
  console.error('Error during sub-problem images creation:', error);
});
```