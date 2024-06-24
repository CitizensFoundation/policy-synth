import weaviate from "weaviate-ts-client";
import { PolicySynthScAgentBase } from "@policysynth/agents//baseAgent.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class PsRagDocumentVectorStore extends PolicySynthScAgentBase {
    static allFieldsToExtract = "title url lastModified size \
       description shortDescription fullDescriptionOfAllContents \
      compressedFullDescriptionOfAllContents \
      contentType allReferencesWithUrls allOtherReferences \
      allImageUrls  documentMetaData\
     _additional { id, distance, confidence }";
    static urlField = "url";
    static weaviateKey = PsRagDocumentVectorStore.getWeaviateKey();
    static client = weaviate.client({
        scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
        host: process.env.WEAVIATE_HOST || "localhost:8080",
        apiKey: new weaviate.ApiKey(PsRagDocumentVectorStore.weaviateKey),
        headers: {
            'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
        },
    });
    static getWeaviateKey() {
        const key = process.env.WEAVIATE_APIKEY || ""; // Provide a default empty string if the key is undefined
        console.log(`Weaviate API Key: ${key ? 'Retrieved successfully' : 'Not found or is empty'}`);
        return key;
    }
    roughFastWordTokenRatio = 1.25;
    maxChunkTokenLength = 500;
    minQualityEloRatingForChunk = 920;
    getEstimateTokenLength(data) {
        const words = data.split(" ");
        return words.length * this.roughFastWordTokenRatio;
    }
    async addSchema() {
        let classObj;
        try {
            const filePath = path.join(__dirname, "./schemas/RagDocument.json");
            const data = await fs.readFile(filePath, "utf8");
            classObj = JSON.parse(data);
        }
        catch (err) {
            console.error(`Error reading file from disk: ${err}`);
            return;
        }
        try {
            const res = await PsRagDocumentVectorStore.client.schema
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
            const res = await PsRagDocumentVectorStore.client.schema.getter().do();
            console.log(JSON.stringify(res, null, 2));
        }
        catch (err) {
            console.error(`Error creating schema: ${err}`);
        }
    }
    async deleteScheme() {
        try {
            const res = await PsRagDocumentVectorStore.client.schema
                .classDeleter()
                .withClassName("RagDocument")
                .do();
            console.log(res);
        }
        catch (err) {
            console.error(`Error creating schema: ${err}`);
        }
    }
    async testQuery() {
        const where = [];
        const res = await PsRagDocumentVectorStore.client.graphql
            .get()
            .withClassName("RagDocument")
            .withFields(
        // TODO: confirm fields
        PsRagDocumentVectorStore.allFieldsToExtract)
            .withNearText({ concepts: ["case study"] })
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
    async postDocument(document) {
        console.log(`Posting document ${JSON.stringify(document, null, 2)}`);
        return this.retry(async () => {
            try {
                const res = await PsRagDocumentVectorStore.client.data
                    .creator()
                    .withClassName("RagDocument")
                    .withProperties(document)
                    .do();
                this.logger.info(`Weaviate: Have saved document ${document.url} ${res.id}`);
                return res.id;
            }
            catch (error) {
                console.error(`Error posting document: ${error}`);
            }
        }, 10, 5000);
    }
    async updateDocument(id, documentData, quiet = false) {
        return new Promise((resolve, reject) => {
            PsRagDocumentVectorStore.client.data
                .merger()
                .withId(id)
                .withClassName("RagDocument")
                .withProperties(documentData)
                .do()
                .then((res) => {
                if (!quiet)
                    this.logger.info(`Weaviate: Have updated web solutions for ${id}`);
                resolve(res);
            })
                .catch((err) => {
                this.logger.error(err.stack || err);
                reject(err);
            });
        });
    }
    async getDocument(id) {
        return new Promise((resolve, reject) => {
            PsRagDocumentVectorStore.client.data
                .getterById()
                .withId(id)
                .withClassName("RagDocument")
                .do()
                .then((res) => {
                this.logger.info(`Weaviate: Have got web page ${id}`);
                const webData = res
                    .properties;
                resolve(webData);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    async searchDocuments(query) {
        const where = [];
        let results;
        try {
            results = await PsRagDocumentVectorStore.client.graphql
                .get()
                .withClassName("RagDocument")
                .withNearText({ concepts: [query] })
                .withLimit(PsConstants.limits.webPageVectorResultsForNewSolutions)
                /*.withWhere({
                  operator: "And",
                  operands: where,
                })*/
                .withFields(PsRagDocumentVectorStore.allFieldsToExtract)
                .do();
        }
        catch (err) {
            throw err;
        }
        return results;
    }
    async searchDocumentsByUrl(docUrl) {
        const where = [
            {
                operator: "Or",
                operands: [
                    {
                        operator: "Equal",
                        path: ["url"],
                        valueString: docUrl
                    }
                ]
            }
        ];
        try {
            let results = await PsRagDocumentVectorStore.client.graphql
                .get()
                .withClassName("RagDocument")
                .withWhere(where[0])
                .withFields(PsRagDocumentVectorStore.urlField)
                .do();
            // Check if results are empty or null and handle accordingly
            if (!results) {
                console.log('No documents found. Database might be empty for this query.');
                // Handle the empty db scenario here, such as continuing with your process
                return null; // Or however you wish to handle this scenario
            }
            return results;
        }
        catch (err) {
            // Handle different errors differently, e.g., schema errors, network errors, etc.
            console.error('Error while querying documents:', err);
            throw err;
        }
    }
    async mergeUniqueById(arr1, arr2) {
        // Helper function to filter duplicates within an array
        const mergedArray = [...arr1, ...arr2];
        // Step 2: Filter out duplicates from the merged array
        const unique = new Map();
        mergedArray.forEach(item => {
            const id = item._additional?.id;
            if (id) {
                unique.set(id, item);
            }
        });
        // Convert the Map back into an array
        return Array.from(unique.values());
    }
    async searchChunksWithReferences(query) {
        let resultsNearText;
        let resultsBm25;
        const where = [
            {
                path: ['compressedContent'],
                operator: 'IsNull',
                valueBoolean: false
            }
        ];
        const searchFields = `
    title
    chunkIndex
    chapterIndex
    mainExternalUrlFound
    shortSummary
    fullSummary
    relevanceEloRating
    qualityEloRating
    substanceEloRating
    compressedContent
    _additional { id, distance, certainty }

    inDocument {
      ... on RagDocument {
        title
        url
        description
        shortDescription
        compressedFullDescriptionOfAllContents
        relevanceEloRating
        qualityEloRating
        substanceEloRating
        allReferencesWithUrls
        contentType
      }
    }

    mostRelevantSiblingChunks {
      ... on RagDocumentChunk {
        title
        chapterIndex
        chunkIndex
        fullSummary
        relevanceEloRating
        qualityEloRating
        substanceEloRating
        compressedContent
      }
    }

    allSiblingChunks {
      ... on RagDocumentChunk {
        title
        chapterIndex
        chunkIndex
        fullSummary
        relevanceEloRating
        qualityEloRating
        substanceEloRating
        compressedContent
      }
    }

    inChunk {
      ... on RagDocumentChunk {
        title
        chunkIndex
        chapterIndex
        mainExternalUrlFound
        shortSummary
        fullSummary
        relevanceEloRating
        qualityEloRating
        compressedContent

        inChunk {
          ... on RagDocumentChunk {
            title
            chunkIndex
            chapterIndex
            shortSummary
            fullSummary
            compressedContent

            inChunk {
              ... on RagDocumentChunk {
                title
                chunkIndex
                chapterIndex
                shortSummary
                fullSummary
                compressedContent

                inChunk {
                  ... on RagDocumentChunk {
                    title
                    chunkIndex
                    chapterIndex
                    shortSummary
                    fullSummary
                    compressedContent

                    inChunk {
                      ... on RagDocumentChunk {
                        title
                        chunkIndex
                        chapterIndex
                        shortSummary
                        fullSummary
                        compressedContent
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
        try {
            // Start both promises simultaneously and wait for all to finish
            const [resultsNearText, resultsBm25] = await Promise.all([
                PsRagDocumentVectorStore.client.graphql
                    .get()
                    .withClassName("RagDocumentChunk")
                    .withNearText({ concepts: [query] })
                    .withLimit(12)
                    .withWhere({
                    operator: "And",
                    operands: where,
                })
                    .withFields(searchFields)
                    .do(),
                PsRagDocumentVectorStore.client.graphql
                    .get()
                    .withClassName("RagDocumentChunk")
                    .withBm25({ 'query': query })
                    .withLimit(2)
                    .withFields(searchFields)
                    .do()
            ]);
            // Assuming mergeUniqueById is already defined and can be used here directly
            const resultsCombined = await this.mergeUniqueById(resultsBm25.data.Get.RagDocumentChunk, resultsNearText.data.Get.RagDocumentChunk);
            return resultsCombined;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}
//# sourceMappingURL=ragDocument.js.map