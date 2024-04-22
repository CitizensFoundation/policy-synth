import { PsEcasYeaRagChunkVectorStore } from "../ragChunk.js";

async function run() {
    const store = new PsEcasYeaRagChunkVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
