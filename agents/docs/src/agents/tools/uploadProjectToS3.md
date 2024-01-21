# uploadJsonToS3

This function uploads a JSON file to an AWS S3 bucket.

## Properties

No properties are defined within this function.

## Methods

| Name              | Parameters                                  | Return Type                     | Description                                      |
|-------------------|---------------------------------------------|---------------------------------|--------------------------------------------------|
| uploadJsonToS3    | bucket: string, filePath: string, key: string | Promise<any>                   | Uploads a JSON file to the specified S3 bucket.  |

## Examples

```typescript
// Example usage of the uploadJsonToS3 function
const bucketName = 'my-bucket';
const filePath = 'path/to/myfile.json';
const key = 'my-uploaded-file.json';

uploadJsonToS3(bucketName, filePath, key)
  .then(data => console.log(`Upload successful: ${JSON.stringify(data)}`))
  .catch(error => console.error(`Upload failed: ${error.message}`));
```