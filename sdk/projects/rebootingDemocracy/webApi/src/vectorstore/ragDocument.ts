import weaviate from "weaviate-ts-client";
import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthAgentBase } from "@policysynth/agents//baseAgent.js";

import { IEngineConstants } from "@policysynth/agents/constants.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PsRagDocumentVectorStore extends PolicySynthAgentBase {
  static allFieldsToExtract =
    "title url lastModified size \
       description shortDescription fullDescriptionOfAllContents \
      compressedFullDescriptionOfAllContents \
      contentType allReferencesWithUrls allOtherReferences \
      allImageUrls  documentMetaData\
     _additional { id, distance }";
  static client: WeaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
    host: process.env.WEAVIATE_HOST || "localhost:8080",
  });

  roughFastWordTokenRatio: number = 1.25;
  maxChunkTokenLength: number = 500;
  minQualityEloRatingForChunk = 920;

  getEstimateTokenLength(data: string): number {
    const words = data.split(" ");
    return words.length * this.roughFastWordTokenRatio;
  }

  async addSchema() {
    let classObj;
    try {
      const filePath = path.join(__dirname, "./schemas/RagDocument.json");
      const data = await fs.readFile(filePath, "utf8");
      classObj = JSON.parse(data);
    } catch (err) {
      console.error(`Error reading file from disk: ${err}`);
      return;
    }

    try {
      const res = await PsRagDocumentVectorStore.client.schema
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
      const res = await PsRagDocumentVectorStore.client.schema.getter().do();
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
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
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async testQuery() {
    const where: any[] = [];

    const res = await PsRagDocumentVectorStore.client.graphql
      .get()
      .withClassName("RagDocument")
      .withFields(
        // TODO: confirm fields
        PsRagDocumentVectorStore.allFieldsToExtract
      )
      .withNearText({ concepts: ["case study"] })
      .withLimit(100)
      .do();

    console.log(JSON.stringify(res, null, 2));
    return res;
  }

  async postDocument(document: PsRagDocumentSource): Promise<string> {
    console.log(`Posting document ${JSON.stringify(document, null, 2)}`);
    return new Promise((resolve, reject) => {
      PsRagDocumentVectorStore.client.data
        .creator()
        .withClassName("RagDocument")
        .withProperties(document as any)
        .do()
        .then((res) => {
          this.logger.info(
            `Weaviate: Have saved document ${document.url} ${res.id}`
          );
          resolve(res.id!);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateDocument(
    id: string,
    documentData: PsRagDocumentSource,
    quiet = false
  ) {
    return new Promise((resolve, reject) => {
      PsRagDocumentVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("RagDocument")
        .withProperties(documentData as any)
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

  async getDocument(id: string): Promise<PsRagDocumentSource> {
    return new Promise((resolve, reject) => {
      PsRagDocumentVectorStore.client.data
        .getterById()
        .withId(id)
        .withClassName("RagDocument")
        .do()
        .then((res) => {
          this.logger.info(`Weaviate: Have got web page ${id}`);
          const webData = (res as IEngineWebPageGraphQlSingleResult)
            .properties as PsRagDocumentSource;
          resolve(webData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async searchDocuments(
    query: string
  ): Promise<PsRagDocumentSourceGraphQlResponse> {
    const where: any[] = [];

    let results;

    try {
      results = await PsRagDocumentVectorStore.client.graphql
        .get()
        .withClassName("RagDocument")
        .withNearText({ concepts: [query] })
        .withLimit(IEngineConstants.limits.webPageVectorResultsForNewSolutions)
        /*.withWhere({
          operator: "And",
          operands: where,
        })*/
        .withFields(PsRagDocumentVectorStore.allFieldsToExtract)
        .do();
    } catch (err) {
      throw err;
    }

    return results as PsRagDocumentSourceGraphQlResponse;
  }

  async searchChunksWithReferences(
    query: string
  ): Promise<PsRagDocumentSource[]> {
    let results;

    try {
      results = await PsRagDocumentVectorStore.client.graphql
        .get()
        .withClassName("RagDocumentChunk")
        .withNearText({ concepts: [query] })
        .withLimit(1)
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
        compressedContent

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
          }
        }

        allSiblingChunks {
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
            substanceEloRating
            compressedContent

            inChunk {
              ... on RagDocumentChunk {
                title
                chunkIndex
                chapterIndex
                shortSummary
                fullSummary
                inChunk {
                  ... on RagDocumentChunk {
                    title
                    chunkIndex
                    chapterIndex
                    shortSummary
                    fullSummary

                    inChunk {
                      ... on RagDocumentChunk {
                        title
                        chunkIndex
                        chapterIndex
                        shortSummary
                        fullSummary
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
        )
        .do();

      const ragDocumentsMap: Map<string, PsRagDocumentSource> = new Map();

      console.log(`Got ${results.data.Get.RagDocumentChunk.length} chunks`);
      console.log(JSON.stringify(results.data.Get.RagDocumentChunk, null, 2));

      for (const chunk of results.data.Get.RagDocumentChunk) {
        if (chunk.inDocument) {
          chunk.inDocument.chunks = [];
          ragDocumentsMap.set(chunk.inDocument.id, chunk.inDocument);
        }
      }

      // Process each RagDocument with its associated chunks
      for (const chunk of results.data.Get.RagDocumentChunk) {
        if (chunk.inDocument) {
          const ragDocument = ragDocumentsMap.get(chunk.inDocument.id);
          if (ragDocument) {
            const flattenedChunks: PsRagChunk[] = [];
            const alwaysAddAllSiblings = true;

            const collectRelevantChunks = (
              chunk: PsRagChunk,
              tokenCountText: string
            ): void => {
              flattenedChunks.push(chunk);
              tokenCountText += chunk.compressedContent;

              if (chunk.allSiblingChunks) {
                for (const sibling of chunk.allSiblingChunks) {
                  if (
                    alwaysAddAllSiblings ||
                    this.getEstimateTokenLength(tokenCountText) +
                      this.getEstimateTokenLength(sibling.compressedContent) <=
                      this.maxChunkTokenLength
                  ) {
                    collectRelevantChunks(sibling, tokenCountText);
                  } else {
                    break;
                  }
                }
              }

              if (
                this.getEstimateTokenLength(tokenCountText) <
                  this.maxChunkTokenLength &&
                chunk.inChunk
              ) {
                collectRelevantChunks(chunk.inChunk[0], tokenCountText);
              }
            };

            collectRelevantChunks(chunk, "");

            // Sort the flattenedChunks based on chunkIndex
            flattenedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

            ragDocument.chunks!.push(chunk);
          } else {
            this.logger.error(
              `RagDocument ${chunk.inDocument.id} not found in map`
            );
          }
        }
      }

      return results.data.Get.RagDocumentChunk as any;
      //return Array.from(ragDocumentsMap.values());
    } catch (err) {
      throw err;
    }
  }

  async searchChunksWithReferencesTEST(
    query: string
  ): Promise<PsRagDocumentSource[]> {
    let results;

    try {
      results = await PsRagDocumentVectorStore.client.graphql
        .get()
        .withClassName("RagDocumentChunk")
        .withNearText({ concepts: [query] })
        .withLimit(1)
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
        allSiblingChunks {
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
            metaDataFields
            metaData
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
            substanceEloRating
            uncompressedContent
            compressedContent
            metaDataFields
            metaData

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
                metaDataFields
                metaData
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
                    metaDataFields
                    metaData

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
                        metaDataFields
                        metaData
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
        )
        .do();

      const ragDocumentsMap: Map<string, PsRagDocumentSource> = new Map();

      console.log(`Got ${results.data.Get.RagDocumentChunk.length} chunks`);
      console.log(JSON.stringify(results.data.Get.RagDocumentChunk, null, 2));

      for (const chunk of results.data.Get.RagDocumentChunk) {
        if (chunk.inDocument) {
          chunk.inDocument.chunks = [];
          ragDocumentsMap.set(chunk.inDocument.id, chunk.inDocument);
        }
      }

      // Process each RagDocument with its associated chunks
      for (const chunk of results.data.Get.RagDocumentChunk) {
        if (chunk.inDocument) {
          const ragDocument = ragDocumentsMap.get(chunk.inDocument.id);
          if (ragDocument) {
            const flattenedChunks: PsRagChunk[] = [];
            const alwaysAddAllSiblings = true;

            const collectRelevantChunks = (
              chunk: PsRagChunk,
              tokenCountText: string
            ): void => {
              flattenedChunks.push(chunk);
              tokenCountText += chunk.compressedContent;

              if (chunk.allSiblingChunks) {
                for (const sibling of chunk.allSiblingChunks) {
                  if (
                    alwaysAddAllSiblings ||
                    this.getEstimateTokenLength(tokenCountText) +
                      this.getEstimateTokenLength(sibling.compressedContent) <=
                      this.maxChunkTokenLength
                  ) {
                    collectRelevantChunks(sibling, tokenCountText);
                  } else {
                    break;
                  }
                }
              }

              if (
                this.getEstimateTokenLength(tokenCountText) <
                  this.maxChunkTokenLength &&
                chunk.inChunk
              ) {
                collectRelevantChunks(chunk.inChunk[0], tokenCountText);
              }
            };

            collectRelevantChunks(chunk, "");

            // Sort the flattenedChunks based on chunkIndex
            flattenedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

            ragDocument.chunks!.push(chunk);
          } else {
            this.logger.error(
              `RagDocument ${chunk.inDocument.id} not found in map`
            );
          }
        }
      }

      return Array.from(ragDocumentsMap.values());
    } catch (err) {
      throw err;
    }
  }

}
