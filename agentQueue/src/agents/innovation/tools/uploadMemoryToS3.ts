import fs from "fs/promises";
import AWS from "aws-sdk";

async function uploadJsonToS3(bucket: string, filePath: string, key: string) {
  const s3 = new AWS.S3();
  const fileContent = await fs.readFile(filePath);

  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ACL: "public-read",
    ContentType: "application/json",
    ContentDisposition: "inline",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err: any, data: any) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

// Usage
if (
  process.env.CURRENT_MEM_UPLOAD_BUCKET &&
  process.env.CURRENT_MEM_UPLOAD_FILENAME
) {
  uploadJsonToS3(
    process.env.CURRENT_MEM_UPLOAD_BUCKET,
    "currentMemory.json",
    process.env.CURRENT_MEM_UPLOAD_FILENAME
  )
    .then((data) => console.log(`Upload response: ${JSON.stringify(data)}`))
    .catch(console.error);
}
