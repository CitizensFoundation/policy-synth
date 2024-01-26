# uploadJsonToS3

This function uploads a JSON file to an AWS S3 bucket.

## Properties

This function does not have properties as it is not a class.

## Methods

| Name            | Parameters                                      | Return Type            | Description                                                                 |
|-----------------|-------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| uploadJsonToS3  | bucket: string, filePath: string, key: string   | Promise<any>           | Uploads a file to S3 with the specified bucket, file path, and key. Sets the ACL to public-read and content type to application/json. |

## Example

```javascript
// Example usage of uploadJsonToS3
import { uploadJsonToS3 } from '@policysynth/agents/tools/uploadProjectToS3.js';

const bucketName = 'your-bucket-name';
const filePath = './path/to/your/file.json';
const key = 'your-desired-S3-key-path/file.json';

uploadJsonToS3(bucketName, filePath, key)
  .then(data => console.log(`Upload successful: ${JSON.stringify(data)}`))
  .catch(error => console.error(`Upload failed: ${error}`));
```