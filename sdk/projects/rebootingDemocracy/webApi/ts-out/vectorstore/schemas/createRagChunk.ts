import { PsRagChunkVectorStore } from "../ragChunk.js";

async function run() {
    const store = new PsRagChunkVectorStore();
    await store.addSchema();
}

run();
