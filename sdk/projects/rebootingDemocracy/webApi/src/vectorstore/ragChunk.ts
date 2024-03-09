import weaviate from "weaviate-ts-client";
import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthAgentBase } from "@policysynth/agents//baseAgent.js";

import { IEngineConstants } from "@policysynth/agents/constants.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PsRagChunkVectorStore extends PolicySynthAgentBase {
  static allFieldsToExtract =
    "title chunkIndex chapterIndex mainExternalUrlFound  \
         shortSummary fullSummary \
      relevanceEloRating qualityEloRating substanceEloRating uncompressedContent \
      compressedContent, metaDataFields metaData\
      category1EloRating, category2EloRating, category3EloRating, category4EloRating\
      category5EloRating, category6EloRating, category7EloRating, category8EloRating\
      category9EloRating, category10EloRating\
     _additional { id, distance, certainty }";
  static client: WeaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
    host: process.env.WEAVIATE_HOST || "localhost:8080",
  });

  async addSchema() {
    let classObj;
    try {
      const filePath = path.join(__dirname, "./schemas/RagChunk.json");
      const data = await fs.readFile(filePath, "utf8");
      classObj = JSON.parse(data);
    } catch (err) {
      console.error(`Error reading file from disk: ${err}`);
      return;
    }

    try {
      const res = await PsRagChunkVectorStore.client.schema
        .classCreator()
        .withClass(classObj)
        .do();
      console.log(res);
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async showScheme() {
    try {
      const res = await PsRagChunkVectorStore.client.schema.getter().do();
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error(`Error showing schema: ${err}`);
    }
  }

  async deleteScheme() {
    try {
      const res = await PsRagChunkVectorStore.client.schema
        .classDeleter()
        .withClassName("RagDocumentChunk")
        .do();
      console.log(res);
    } catch (err) {
      console.error(`Error deleting schema: ${err}`);
    }
  }

  async testQuery() {
    const res = await PsRagChunkVectorStore.client.graphql
      .get()
      .withClassName("RagDocumentChunk")
      .withFields(PsRagChunkVectorStore.allFieldsToExtract)
      .withNearText({ concepts: ["specific concept"] })
      .withLimit(100)
      .do();

    console.log(JSON.stringify(res, null, 2));
    return res;
  }

  async postChunk(chunkData: PsRagChunk) {
    console.log(`Posting chunk ${chunkData.title}`)
    return new Promise((resolve, reject) => {
      PsRagChunkVectorStore.client.data
        .creator()
        .withClassName("RagDocumentChunk")
        .withProperties(chunkData as any)
        .do()
        .then((res: any) => {
          this.logger.info(`Weaviate: Have saved chunk ${chunkData.title}`);
          resolve(res.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async addCrossReference(
    sourceId: string,
    propertyName: string,
    targetId: string,
    targetClassName: string
  ) {
    return new Promise((resolve, reject) => {
      PsRagChunkVectorStore.client.data
        .referenceCreator()
        .withId(sourceId)
        .withReferenceProperty(propertyName)
        .withReference({ beacon: targetId })
        .withClassName(targetClassName)
        .do()
        .then((res) => {
          this.logger.info(
            `Weaviate: Added cross reference from ${sourceId} to ${targetId} via ${propertyName}`
          );
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateChunk(id: string, chunkData: PsRagChunk, quiet = false) {
    return new Promise((resolve, reject) => {
      PsRagChunkVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("RagDocumentChunk")
        .withProperties(chunkData as any)
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

  async getChunk(id: string): Promise<PsRagChunk> {
    return new Promise((resolve, reject) => {
      PsRagChunkVectorStore.client.data
        .getterById()
        .withId(id)
        .withClassName("RagDocumentChunk")
        .do()
        .then((res) => {
          this.logger.info(`Weaviate: Have got chunk ${id}`);
          const chunkData = res.properties as unknown as PsRagChunk;
          resolve(chunkData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async searchChunks(query: string): Promise<PsRagChunkGraphQlResponse> {
    let results;

    try {
      results = await PsRagChunkVectorStore.client.graphql
        .get()
        .withClassName("RagDocumentChunk")
        .withNearText({ concepts: [query] })
        .withLimit(25)
        .withFields(PsRagChunkVectorStore.allFieldsToExtract)
        .do();
    } catch (err) {
      throw err;
    }

    return results as PsRagChunkGraphQlResponse;
  }

  async searchChunksWithReferences(
    query: string,
    minRelevanceEloRating = 900,
    minSubstanceEloRating = 900
  ): Promise<PsRagChunkGraphQlResponse> {
    let results;

    try {
      results = await PsRagChunkVectorStore.client.graphql
        .get()
        .withClassName("RagDocumentChunk")
        .withNearText({ concepts: [query] })
        .withLimit(25)
        .withFields(
          `
          title
          chunkIndex
          chapterIndex
          mainExternalUrlFound
          shortSummary
          fullSummary
          relevanceEloRating
          qualityEloRating
          substanceEloRating
          uncompressedContent
          compressedContent
          metaDataFields
          metaData
          mostRelevantSiblingChunks(where: {
            path: ["relevanceEloRating"],
            operator: GreaterThan,
            valueInt: ${minRelevanceEloRating}
          }) {
            title
            chunkIndex
            chapterIndex
            mainExternalUrlFound
            shortSummary
            fullSummary
            relevanceEloRating
            qualityEloRating
            substanceEloRating
            uncompressedContent
            compressedContent
            importantContextChunkIndexes
            metaDataFields
            metaData
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
              substanceEloRating
              uncompressedContent
              compressedContent
              importantContextChunkIndexes
              metaDataFields
              metaData

              inChunk {
                ... on RagDocumentChunk {
                  title
                  chunkIndex
                  chapterIndex
                }
              }
            }
          }
        `
        )
        .do();
    } catch (err) {
      throw err;
    }

    return results as PsRagChunkGraphQlResponse;
  }
}
