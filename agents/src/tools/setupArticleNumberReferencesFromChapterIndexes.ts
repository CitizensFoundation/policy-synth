import weaviate from "weaviate-ts-client";
import { WeaviateClient } from "weaviate-ts-client";
import pLimit from "p-limit";
import { PolicySynthAgentBase } from "../base/agentBase.js";

const LAW_COLLECTION_CLASS = "LawCollection";
const LAW_COLLECTION_ARTICLE_CLASS = "LawCollectionArticle";

const DOC_CONCURRENCY = 20;
const CHUNK_CONCURRENCY = 100;

const client: WeaviateClient = weaviate.client({
  scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
  host: process.env.WEAVIATE_HOST || "localhost:8080",
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_APIKEY || ""),
});

interface LawCollectionDocument {
  id: string;
  chapterIndex: number;
}

interface LawCollectionArticleChunk {
  id: string;
  articleNumberReference?: string[];
}

interface GraphQLGetResponse<T> {
  data: {
    Get: {
      [className: string]: T[];
    };
  };
}

async function addArticleNumberReferenceIndexToChunks(): Promise<void> {
  try {
    await client.schema
      .propertyCreator()
      .withClassName(LAW_COLLECTION_ARTICLE_CLASS)
      .withProperty({
        name: "articleNumberReference",
        dataType: ["text"],
        indexInverted: true,
      })
      .do();
    PolicySynthAgentBase.logger.info(
      "Created index for articleNumberReference on chunks"
    );
  } catch (err) {
    PolicySynthAgentBase.logger.error(
      "Error creating articleNumberReference index",
      err
    );
  }
}

async function fetchAllLawCollectionDocuments(): Promise<
  LawCollectionDocument[]
> {
  const documents: LawCollectionDocument[] = [];
  let cursor: string | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const getter = client.graphql
      .get()
      .withClassName(LAW_COLLECTION_CLASS)
      .withFields("chapterIndex _additional { id }")
      .withLimit(100);

    if (cursor) {
      getter.withAfter(cursor);
    }

    const res = (await getter.do()) as unknown as GraphQLGetResponse<{
      chapterIndex: number;
      _additional: { id: string };
    }>;

    const batch = res.data.Get[LAW_COLLECTION_CLASS];
    if (!batch || batch.length === 0) {
      break;
    }

    documents.push(
      ...batch.map((doc) => ({
        id: doc._additional.id,
        chapterIndex: doc.chapterIndex,
      }))
    );

    cursor = batch[batch.length - 1]._additional.id;
  }

  return documents;
}

async function fetchChunksForDocument(
  documentId: string
): Promise<LawCollectionArticleChunk[]> {
  const chunks: LawCollectionArticleChunk[] = [];
  let cursor: string | undefined;
  const whereFilter = {
    path: ["inDocument"],
    operator: "Equal" as const,
    valueText: documentId,
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const getter = client.graphql
      .get()
      .withClassName(LAW_COLLECTION_ARTICLE_CLASS)
      .withWhere(whereFilter)
      .withFields("articleNumberReference _additional { id }")
      .withLimit(100);

    if (cursor) {
      getter.withAfter(cursor);
    }

    const res = (await getter.do()) as unknown as GraphQLGetResponse<{
      articleNumberReference?: string[];
      _additional: { id: string };
    }>;

    const batch = res.data.Get[LAW_COLLECTION_ARTICLE_CLASS];
    if (!batch || batch.length === 0) {
      break;
    }

    chunks.push(
      ...batch.map((chunk) => ({
        id: chunk._additional.id,
        articleNumberReference: chunk.articleNumberReference,
      }))
    );

    cursor = batch[batch.length - 1]._additional.id;
  }

  return chunks;
}

async function updateChunkArticleReference(
  chunk: LawCollectionArticleChunk,
  chapterIndex: number
): Promise<void> {
  const reference = `${chapterIndex}. gr.`;
  const currentRefs = chunk.articleNumberReference || [];
  if (currentRefs.includes(reference)) {
    return;
  }

  const updatedRefs = [...currentRefs, reference];

  try {
    await client.data
      .updater()
      .withClassName(LAW_COLLECTION_ARTICLE_CLASS)
      .withId(chunk.id)
      .withProperties({
        articleNumberReference: updatedRefs,
      })
      .do();
  } catch (err) {
    PolicySynthAgentBase.logger.error(
      `Failed updating chunk ${chunk.id} with chapter index ${chapterIndex}`,
      err
    );
  }
}

async function main(): Promise<void> {
  await addArticleNumberReferenceIndexToChunks();

  const documents = await fetchAllLawCollectionDocuments();
  const docLimit = pLimit(DOC_CONCURRENCY);

  await Promise.all(
    documents.map((doc) =>
      docLimit(async () => {
        const chunks = await fetchChunksForDocument(doc.id);
        const chunkLimit = pLimit(CHUNK_CONCURRENCY);

        await Promise.all(
          chunks.map((chunk) =>
            chunkLimit(() => updateChunkArticleReference(chunk, doc.chapterIndex))
          )
        );
      })
    )
  );

  PolicySynthAgentBase.logger.info("Completed updating article references");
}

await main();
