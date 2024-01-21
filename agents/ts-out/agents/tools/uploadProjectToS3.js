import fs from "fs/promises";
import AWS from "aws-sdk";
const projectId = process.argv[2];
async function uploadJsonToS3(bucket, filePath, key) {
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
        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}
// Usage
if (process.env.CURRENT_MEM_UPLOAD_BUCKET &&
    process.env.CURRENT_MEM_UPLOAD_PATH &&
    projectId) {
    uploadJsonToS3(process.env.CURRENT_MEM_UPLOAD_BUCKET, `currentProject${projectId}.json`, `${process.env.CURRENT_MEM_UPLOAD_PATH}currentProject${projectId}.json`)
        .then((data) => console.log(`Upload response: ${JSON.stringify(data)}`))
        .catch(console.error);
}
//# sourceMappingURL=uploadProjectToS3.js.map