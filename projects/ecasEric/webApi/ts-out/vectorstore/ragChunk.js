import weaviate from "weaviate-ts-client";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class PsEcasYeaRagChunkVectorStore extends PolicySynthStandaloneAgent {
    static allFieldsToExtract = "question answer isEuWideOrCountrySpecific\
     _additional { id, distance, certainty }";
    static client = weaviate.client({
        scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
        host: process.env.WEAVIATE_HOST || "localhost:8080",
    });
    async addSchema() {
        let classObj;
        try {
            const filePath = path.join(__dirname, "./schemas/RagChunk.json");
            const data = await fs.readFile(filePath, "utf8");
            classObj = JSON.parse(data);
        }
        catch (err) {
            console.error(`Error reading file from disk: ${err}`);
            return;
        }
        try {
            const res = await PsEcasYeaRagChunkVectorStore.client.schema
                .classCreator()
                .withClass(classObj)
                .do();
            console.log(res);
        }
        catch (err) {
            console.error(`Error creating schema: ${err}`);
        }
    }
    async showScheme() {
        try {
            const res = await PsEcasYeaRagChunkVectorStore.client.schema.getter().do();
            console.log(JSON.stringify(res, null, 2));
        }
        catch (err) {
            console.error(`Error showing schema: ${err}`);
        }
    }
    async deleteScheme() {
        try {
            const res = await PsEcasYeaRagChunkVectorStore.client.schema
                .classDeleter()
                .withClassName("RagDocumentChunk")
                .do();
            console.log(res);
        }
        catch (err) {
            console.error(`Error deleting schema: ${err}`);
        }
    }
    async testQuery() {
        const res = await PsEcasYeaRagChunkVectorStore.client.graphql
            .get()
            .withClassName("RagDocumentChunk")
            .withFields(PsEcasYeaRagChunkVectorStore.allFieldsToExtract)
            .withNearText({ concepts: ["specific concept"] })
            .withLimit(100)
            .do();
        console.log(JSON.stringify(res, null, 2));
        return res;
    }
    //TODO: Move to base class
    async retry(fn, retries = 10, delay = 5000) {
        try {
            return await fn();
        }
        catch (err) {
            if (retries > 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.retry(fn, retries - 1, delay);
            }
            else {
                throw err;
            }
        }
    }
    async postChunk(chunkData) {
        console.log(`Posting chunk ${chunkData.question}`);
        return this.retry(async () => {
            try {
                const res = await PsEcasYeaRagChunkVectorStore.client.data
                    .creator()
                    .withClassName("EcasYeaRagDocumentChunk")
                    .withProperties(chunkData)
                    .do();
                this.logger.info(`Weaviate: Have saved chunk ${chunkData.question}`);
                return res.id;
            }
            catch (err) {
                console.error(`Error posting chunk: ${err}`);
            }
        }, 3, 1000);
    }
    async updateChunk(id, chunkData, quiet = false) {
        return new Promise((resolve, reject) => {
            PsEcasYeaRagChunkVectorStore.client.data
                .merger()
                .withId(id)
                .withClassName("EcasYeaRagDocumentChunk")
                .withProperties(chunkData)
                .do()
                .then((res) => {
                if (!quiet)
                    this.logger.info(`Weaviate: Have updated chunk for ${id}`);
                resolve(res);
            })
                .catch((err) => {
                this.logger.error(err.stack || err);
                reject(err);
            });
        });
    }
    async getChunk(id) {
        return new Promise((resolve, reject) => {
            PsEcasYeaRagChunkVectorStore.client.data
                .getterById()
                .withId(id)
                .withClassName("EcasYeaRagDocumentChunk")
                .do()
                .then((res) => {
                this.logger.info(`Weaviate: Have got chunk ${id}`);
                const chunkData = res.properties;
                resolve(chunkData);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    async searchChunks(query) {
        let results;
        try {
            results = await PsEcasYeaRagChunkVectorStore.client.graphql
                .get()
                .withClassName("EcasYeaRagDocumentChunk")
                .withNearText({ concepts: [query] })
                .withLimit(22)
                .withFields(PsEcasYeaRagChunkVectorStore.allFieldsToExtract)
                .do();
        }
        catch (err) {
            throw err;
        }
        return results;
    }
}
//# sourceMappingURL=ragChunk.js.map