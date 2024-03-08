import weaviate from "weaviate-ts-client";
import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthAgentBase } from "@policysynth/agents//baseAgent.js";

import { IEngineConstants } from "@policysynth/agents/constants.js";
import fs from "fs/promises";

export class PsRagDocumentVectorStore extends PolicySynthAgentBase {
  static allFieldsToExtract =
    "title url lastModified size \
      cleanedDocument description shortDescription fullDescriptionOfAllContents \
      compressedFullDescriptionOfAllContents \
      contentType allReferencesWithUrls allOtherReferences \
      allImageUrls documentDate documentMetaData\
     _additional { id, distance }";
  static client: WeaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
    host: process.env.WEAVIATE_HOST || "localhost:8080",
  });

  async addSchema() {
    let classObj;
    try {
      const data = await fs.readFile("./schemas/RagDocument.json", "utf8");
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
    return new Promise((resolve, reject) => {
      PsRagDocumentVectorStore.client.data
        .creator()
        .withClassName("RagDocument")
        .withProperties(document as any)
        .do()
        .then((res) => {
          this.logger.info(`Weaviate: Have saved document ${document.url}`);
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
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(PsRagDocumentVectorStore.allFieldsToExtract)
        .do();
    } catch (err) {
      throw err;
    }

    return results as PsRagDocumentSourceGraphQlResponse;
  }

  async searchChunksWithReferences(
    query: string
  ): Promise<PsRagChunkGraphQlResponse> {
    let results;

    try {
      results = await PsRagDocumentVectorStore.client.graphql
        .get()
        .withClassName("RagChunk")
        .withNearText({ concepts: [query] })
        .withLimit(25)
        .withFields(
          `
          title
          chunkIndex
          chapterIndex
          documentIndex
          mainExternalUrlFound
          data
          actualStartLine
          startLine
          actualEndLine
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
          connectedChunks(where: {
            path: ["relevanceEloRating"],
            operator: GreaterThan,
            valueInt: 950
          }) {
            title
            chunkIndex
            chapterIndex
            documentIndex
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
            ... on RagChunk {
              title
              chunkIndex
              chapterIndex
              documentIndex
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
                ... on RagChunk {
                  title
                  chunkIndex
                  chapterIndex
                  documentIndex
                }
              }
            }
          }
        `
        )
        .do();

      const enrichedChunks: PsRagChunk[] = [];

      for (const chunk of results.data.Get.RagChunk) {
        let contextChunks: PsRagChunk[] = [];
        let characterCount = 0;

        // Add the current chunk to the context
        contextChunks.push(chunk);
        characterCount += chunk.uncompressedContent.length;

        // Add sibling chunks to the context
        if (chunk.connectedChunks) {
          for (const sibling of chunk.connectedChunks) {
            if (characterCount + sibling.uncompressedContent.length <= 1000) {
              contextChunks.push(sibling);
              characterCount += sibling.uncompressedContent.length;
            } else {
              break;
            }
          }
        }

        // If character count is still less than 1000, add parent chunks with content
        if (characterCount < 1000 && chunk.inChunk) {
          const parent = chunk.inChunk;
          if (parent.connectedChunks) {
            for (const parentSibling of parent.connectedChunks) {
              if (
                parentSibling.uncompressedContent &&
                characterCount + parentSibling.uncompressedContent.length <=
                  1000
              ) {
                contextChunks.push(parentSibling);
                characterCount += parentSibling.uncompressedContent.length;
              } else {
                break;
              }
            }
          }
        }

        enrichedChunks.push({
          ...chunk,
          subChunks: contextChunks,
        });
      }

      // Sort the enrichedChunks based on chunkIndex
      enrichedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

      return {
        data: {
          Get: {
            RagChunk: enrichedChunks,
          },
        },
      } as PsRagChunkGraphQlResponse;
    } catch (err) {
      throw err;
    }
  }
}
